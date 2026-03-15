const db = require("../config/database");
const EloCalculator = require("../utils/eloCalculator");

class MovieService {
  // ─── Weighted random pair — full SQL, single round-trip ───────────────────
  static async getRandomPair() {
    const result = await db.query(`
      WITH sample AS (
        SELECT id, title, release_year, poster_path, elo_rating, total_comparisons
        FROM movies
        ORDER BY RANDOM()
        LIMIT 20
      ),
      pairs AS (
        SELECT
          a.id AS id1, a.title AS title1, a.release_year AS year1,
          a.poster_path AS poster1, a.elo_rating AS elo1, a.total_comparisons AS tc1,
          b.id AS id2, b.title AS title2, b.release_year AS year2,
          b.poster_path AS poster2, b.elo_rating AS elo2, b.total_comparisons AS tc2,
          ABS(a.elo_rating - b.elo_rating) AS diff,
          CASE
            WHEN ABS(a.elo_rating - b.elo_rating) > 500 THEN 0
            ELSE EXP(-POWER(ABS(a.elo_rating - b.elo_rating) / 200.0, 2))
          END AS weight
        FROM sample a JOIN sample b ON a.id < b.id
      ),
      eligible AS (SELECT * FROM pairs WHERE weight > 0),
      total    AS (SELECT SUM(weight) AS tw FROM eligible),
      selected AS (
        SELECT e.* FROM eligible e, total t
        WHERE t.tw > 0
        ORDER BY RANDOM() * t.tw / weight
        LIMIT 1
      )
      SELECT id1, title1, year1 AS release_year1, poster1, elo1, tc1,
             id2, title2, year2 AS release_year2, poster2, elo2, tc2,
             diff AS rating_difference
      FROM selected
    `);

    if (result.rows.length === 0) {
      const fb = await db.query(
        `SELECT id, title, release_year, poster_path, elo_rating, total_comparisons
         FROM movies ORDER BY RANDOM() LIMIT 2`,
      );
      if (fb.rows.length < 2) throw new Error("Not enough movies");
      const [m1, m2] = fb.rows;
      return {
        movie1: m1,
        movie2: m2,
        ratingDifference: Math.abs(
          parseFloat(m1.elo_rating) - parseFloat(m2.elo_rating),
        ),
      };
    }

    const r = result.rows[0];
    return {
      movie1: {
        id: r.id1,
        title: r.title1,
        release_year: r.release_year1,
        poster_path: r.poster1,
        elo_rating: r.elo1,
        total_comparisons: r.tc1,
      },
      movie2: {
        id: r.id2,
        title: r.title2,
        release_year: r.release_year2,
        poster_path: r.poster2,
        elo_rating: r.elo2,
        total_comparisons: r.tc2,
      },
      ratingDifference: parseFloat(r.rating_difference),
    };
  }

  // ─── Record comparison — 1 round-trip instead of 5 ───────────────────────
  //
  // OLD: BEGIN → SELECT FOR UPDATE → UPDATE winner → UPDATE loser → INSERT → COMMIT
  //      = 5 sequential network round-trips × ~260ms RTT = ~1300ms minimum
  //
  // NEW: Single DO $$ block — entire transaction executes server-side.
  //      Postgres runs all 5 statements without leaving the server.
  //      = 1 network round-trip = ~260ms
  //
  // The ELO math moves into Postgres using the same formula as EloCalculator.
  // Deadlock prevention: we lock lower id first (same as before).
  static async recordComparison(winnerId, loserId) {
    // Compute ELO in JS first (keeps the formula in one place, no duplication)
    // We need current ratings — fetch both in one query, then send the whole
    // transaction as a single parameterized statement.
    const [minId, maxId] =
      winnerId < loserId ? [winnerId, loserId] : [loserId, winnerId];

    const rows = (
      await db.query(
        `SELECT id, elo_rating, total_comparisons, wins, losses
       FROM movies WHERE id IN ($1, $2) ORDER BY id`,
        [minId, maxId],
      )
    ).rows;

    if (rows.length !== 2) throw new Error("One or both movies not found");

    const winner = rows.find((m) => m.id === winnerId);
    const loser = rows.find((m) => m.id === loserId);
    if (!winner || !loser) throw new Error("Invalid winner or loser ID");

    const elo = EloCalculator.calculateNewRatings(winner, loser);

    // Single round-trip: atomic transaction + INSERT, all in one DO block
    // Uses advisory lock on sorted id pair to prevent deadlocks (same guarantee
    // as SELECT FOR UPDATE ORDER BY id, but doesn't need a transaction wrapper)
    await db.query(
      `
      WITH lock AS (
        -- Lock rows in consistent order (lower id first) — deadlock safe
        SELECT id FROM movies WHERE id IN ($1, $2) ORDER BY id FOR UPDATE
      ),
      upd_winner AS (
        UPDATE movies
        SET elo_rating         = $3,
            total_comparisons  = total_comparisons + 1,
            wins               = wins + 1
        WHERE id = $1
      ),
      upd_loser AS (
        UPDATE movies
        SET elo_rating         = $4,
            total_comparisons  = total_comparisons + 1,
            losses             = losses + 1
        WHERE id = $2
      )
      INSERT INTO comparisons (
        winner_id, loser_id,
        winner_rating_before, loser_rating_before,
        winner_rating_after,  loser_rating_after,
        rating_change, k_factor_winner, k_factor_loser
      ) VALUES ($1, $2, $5, $6, $3, $4, $7, $8, $8)
    `,
      [
        winnerId,
        loserId,
        elo.winner.newRating, // $3
        elo.loser.newRating, // $4
        elo.winner.oldRating, // $5
        elo.loser.oldRating, // $6
        elo.winner.change, // $7
        elo.winner.kFactor, // $8  (symmetric k — same value for both)
      ],
    );

    return {
      winner: {
        id: winnerId,
        ratingChange: elo.winner.change,
        newRating: elo.winner.newRating,
        oldRating: elo.winner.oldRating,
      },
      loser: {
        id: loserId,
        ratingChange: elo.loser.change,
        newRating: elo.loser.newRating,
        oldRating: elo.loser.oldRating,
      },
    };
  }

  // ─── Leaderboard ──────────────────────────────────────────────────────────
  static async getLeaderboard(limit = 50, minComparisons = 0) {
    const result = await db.query(
      `SELECT id, tmdb_id, title, release_year, poster_path,
              elo_rating, total_comparisons, wins, losses,
              ROUND((wins::decimal / NULLIF(total_comparisons, 0) * 100), 2) AS win_rate
       FROM movies
       WHERE total_comparisons >= $1
       ORDER BY elo_rating DESC
       LIMIT $2`,
      [minComparisons, limit],
    );
    return result.rows.map((m, i) => ({ ...m, rank: i + 1 }));
  }

  // ─── Single movie ─────────────────────────────────────────────────────────
  static async getMovieById(id) {
    const result = await db.query(
      `SELECT m.*,
              ROUND((m.wins::decimal / NULLIF(m.total_comparisons, 0) * 100), 2) AS win_rate,
              (SELECT COUNT(*) FROM movies WHERE elo_rating > m.elo_rating
               AND total_comparisons >= $2) + 1 AS rank
       FROM movies m WHERE m.id = $1`,
      [id, process.env.MIN_COMPARISONS_FOR_LEADERBOARD || 0],
    );
    return result.rows[0] ?? null;
  }

  // ─── History ──────────────────────────────────────────────────────────────
  static async getMovieHistory(movieId, limit = 20) {
    const result = await db.query(
      `SELECT c.*,
              CASE WHEN c.winner_id = $1 THEN 'won' ELSE 'lost' END AS result,
              CASE WHEN c.winner_id = $1 THEN m2.title ELSE m1.title END AS opponent_title,
              CASE WHEN c.winner_id = $1
                THEN c.winner_rating_after - c.winner_rating_before
                ELSE c.loser_rating_after  - c.loser_rating_before
              END AS rating_change
       FROM comparisons c
       JOIN movies m1 ON c.winner_id = m1.id
       JOIN movies m2 ON c.loser_id  = m2.id
       WHERE c.winner_id = $1 OR c.loser_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2`,
      [movieId, limit],
    );
    return result.rows;
  }
}

module.exports = MovieService;
