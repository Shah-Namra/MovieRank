const db = require("../config/database");
const EloCalculator = require("../utils/eloCalculator");

class MovieService {
  // Weighted random pair of movies for comparison
  static async getRandomPair() {
    let client;

    try {
      client = await db.pool.connect();

      // Get all movies with at least one comparison (to avoid brand new movies) or if no such exist, get new
      const result = await client.query(`
        SELECT id, title, release_year, poster_path, elo_rating, total_comparisons
        FROM movies
        ORDER BY RANDOM()
        LIMIT 100
      `);

      if (result.rows.length < 2) {
        throw new Error("Not enough movies in database");
      }

      const movies = result.rows;

      // Calculate pairing weights for all possible pairs
      const pairs = [];
      for (let i = 0; i < movies.length; i++) {
        for (let j = i + 1; j < movies.length; j++) {
          const movie1 = movies[i];
          const movie2 = movies[j];
          const ratingDiff = Math.abs(
            parseFloat(movie1.elo_rating) - parseFloat(movie2.elo_rating)
          );
          const weight = EloCalculator.getPairingWeight(ratingDiff);

          pairs.push({
            movie1,
            movie2,
            weight,
            ratingDiff,
          });
        }
      }

      // Select a pair using weighted random selection
      const totalWeight = pairs.reduce((sum, pair) => sum + pair.weight, 0);
      let random = Math.random() * totalWeight;

      for (const pair of pairs) {
        random -= pair.weight;
        if (random <= 0) {
          return {
            movie1: pair.movie1,
            movie2: pair.movie2,
            ratingDifference: pair.ratingDiff,
          };
        }
      }

      // Fallback (shouldn't reach here)
      return {
        movie1: pairs[0].movie1,
        movie2: pairs[0].movie2,
        ratingDifference: pairs[0].ratingDiff,
      };
    } catch (error) {
      console.error("Error in getRandomPair:", error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Record a comparison and update Elo ratings
  // db transactions to ensure atomicity
  static async recordComparison(winnerId, loserId) {
    let client;

    try {
      client = await db.pool.connect();
      await client.query("BEGIN");

      // Lock both movies for update
      // SELECT FOR UPDATE with specific row for deadlocks
      const movieIds = [winnerId, loserId].sort((a, b) => a - b);

      const lockedMovies = await client.query(
        `SELECT id, elo_rating, total_comparisons, wins, losses
         FROM movies
         WHERE id = ANY($1::int[])
         ORDER BY id
         FOR UPDATE`,
        [movieIds]
      );

      if (lockedMovies.rows.length !== 2) {
        throw new Error("One or both movies not found");
      }

      // winner and loser from locked rows
      const winner = lockedMovies.rows.find((m) => m.id === winnerId);
      const loser = lockedMovies.rows.find((m) => m.id === loserId);

      if (!winner || !loser) {
        throw new Error("Invalid winner or loser ID");
      }

      // new Elo ratings
      const eloResult = EloCalculator.calculateNewRatings(winner, loser);

      // Update winner
      await client.query(
        `UPDATE movies
         SET elo_rating = $1,
             total_comparisons = total_comparisons + 1,
             wins = wins + 1
         WHERE id = $2`,
        [eloResult.winner.newRating, winnerId]
      );

      // Update loser
      await client.query(
        `UPDATE movies
         SET elo_rating = $1,
             total_comparisons = total_comparisons + 1,
             losses = losses + 1
         WHERE id = $2`,
        [eloResult.loser.newRating, loserId]
      );

      // Record comparison in history
      await client.query(
        `INSERT INTO comparisons (
          winner_id, loser_id,
          winner_rating_before, loser_rating_before,
          winner_rating_after, loser_rating_after,
          rating_change, k_factor_winner, k_factor_loser
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          winnerId,
          loserId,
          eloResult.winner.oldRating,
          eloResult.loser.oldRating,
          eloResult.winner.newRating,
          eloResult.loser.newRating,
          eloResult.winner.change,
          eloResult.winner.kFactor,
          eloResult.loser.kFactor,
        ]
      );

      await client.query("COMMIT");

      return {
        winner: {
          id: winnerId,
          ratingChange: eloResult.winner.change,
          newRating: eloResult.winner.newRating,
          oldRating: eloResult.winner.oldRating,
        },
        loser: {
          id: loserId,
          ratingChange: eloResult.loser.change,
          newRating: eloResult.loser.newRating,
          oldRating: eloResult.loser.oldRating,
        },
      };
    } catch (error) {
      if (client) {
        await client.query("ROLLBACK");
      }
      console.error("Error in recordComparison:", error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  // Get leaderboard with min comparison threshold
  static async getLeaderboard(limit = 50, minComparisons = 20) {
    const result = await db.query(
      `SELECT 
        id, tmdb_id, title, release_year, poster_path,
        elo_rating, total_comparisons, wins, losses,
        ROUND((wins::decimal / NULLIF(total_comparisons, 0) * 100), 2) as win_rate
       FROM movies
       WHERE total_comparisons >= $1
       ORDER BY elo_rating DESC
       LIMIT $2`,
      [minComparisons, limit]
    );

    return result.rows.map((movie, index) => ({
      ...movie,
      rank: index + 1,
    }));
  }

  // Individual movie details with stats
  static async getMovieById(id) {
    const result = await db.query(
      `SELECT 
        m.*,
        ROUND((m.wins::decimal / NULLIF(m.total_comparisons, 0) * 100), 2) as win_rate,
        (SELECT COUNT(*) FROM movies WHERE elo_rating > m.elo_rating AND total_comparisons >= $2) + 1 as rank
       FROM movies m
       WHERE m.id = $1`,
      [id, process.env.MIN_COMPARISONS_FOR_LEADERBOARD || 20]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  // Recent comparison history for movie
  static async getMovieHistory(movieId, limit = 20) {
    const result = await db.query(
      `SELECT 
        c.*,
        CASE 
          WHEN c.winner_id = $1 THEN 'won'
          ELSE 'lost'
        END as result,
        CASE 
          WHEN c.winner_id = $1 THEN m2.title
          ELSE m1.title
        END as opponent_title,
        CASE 
          WHEN c.winner_id = $1 THEN c.winner_rating_after - c.winner_rating_before
          ELSE c.loser_rating_after - c.loser_rating_before
        END as rating_change
       FROM comparisons c
       JOIN movies m1 ON c.winner_id = m1.id
       JOIN movies m2 ON c.loser_id = m2.id
       WHERE c.winner_id = $1 OR c.loser_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2`,
      [movieId, limit]
    );

    return result.rows;
  }
}

module.exports = MovieService;
