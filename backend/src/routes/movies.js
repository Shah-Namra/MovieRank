const express = require("express");
const router = express.Router();
const MovieService = require("../services/movieService");
const db = require("../config/database");

// GET /api/movies/pair
router.get("/pair", async (req, res) => {
  try {
    const pair = await MovieService.getRandomPair();
    res.json({ success: true, data: pair });
  } catch (error) {
    console.error("Error getting movie pair:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to get movie pair",
        message: error.message,
      });
  }
});

// GET /api/movies/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const minComparisons =
      parseInt(req.query.minComparisons) ??
      parseInt(process.env.MIN_COMPARISONS_FOR_LEADERBOARD) ??
      0;
    const leaderboard = await MovieService.getLeaderboard(
      limit,
      minComparisons,
    );
    res.json({
      success: true,
      data: {
        movies: leaderboard,
        meta: { total: leaderboard.length, minComparisons, limit },
      },
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to get leaderboard",
        message: error.message,
      });
  }
});

// GET /api/movies/stats — expanded with hall-of-fame records, all in one query
router.get("/stats", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        -- Global counts
        (SELECT COUNT(*)        FROM comparisons)::int                                 AS total_comparisons,
        (SELECT COUNT(*)        FROM movies)::int                                      AS total_movies,
        (SELECT COUNT(*)        FROM movies WHERE total_comparisons > 0)::int          AS movies_on_leaderboard,
        ROUND((SELECT AVG(total_comparisons) FROM movies), 1)                         AS avg_comparisons_per_movie,

        -- Most battled
        (SELECT title           FROM movies ORDER BY total_comparisons DESC LIMIT 1)  AS most_compared_movie,
        (SELECT total_comparisons FROM movies ORDER BY total_comparisons DESC LIMIT 1)::int AS most_compared_count,

        -- Most wins (raw win count)
        (SELECT title           FROM movies ORDER BY wins DESC LIMIT 1)               AS most_wins_movie,
        (SELECT wins            FROM movies ORDER BY wins DESC LIMIT 1)::int          AS most_wins_count,

        -- Highest ELO rating
        (SELECT title           FROM movies ORDER BY elo_rating DESC LIMIT 1)         AS highest_rated_movie,
        ROUND((SELECT elo_rating FROM movies ORDER BY elo_rating DESC LIMIT 1), 0)::int AS highest_rated_score,

        -- Most dominant: best win rate with at least 10 comparisons
        (SELECT title           FROM movies WHERE total_comparisons >= 10 ORDER BY (wins::float / NULLIF(total_comparisons,0)) DESC LIMIT 1) AS most_dominant_movie,
        ROUND((SELECT wins::numeric / NULLIF(total_comparisons,0) * 100 FROM movies WHERE total_comparisons >= 10 ORDER BY (wins::float / NULLIF(total_comparisons,0)) DESC LIMIT 1), 1) AS most_dominant_rate,

        -- Biggest upset potential: lowest ELO but most battles (keeps fighting)
        (SELECT title           FROM movies WHERE total_comparisons >= 10 ORDER BY elo_rating ASC LIMIT 1) AS underdog_movie,
        ROUND((SELECT elo_rating FROM movies WHERE total_comparisons >= 10 ORDER BY elo_rating ASC LIMIT 1), 0)::int AS underdog_score,

        -- Longest winning streak approximation: most wins in last 20 comparisons
        (SELECT m.title
         FROM movies m
         WHERE m.total_comparisons >= 5
         ORDER BY m.wins::float / NULLIF(m.total_comparisons, 0) DESC, m.wins DESC
         LIMIT 1
        ) AS hottest_movie

    `);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/movies/compare
router.post("/compare", async (req, res) => {
  try {
    const { winnerId, loserId } = req.body;
    if (!winnerId || !loserId)
      return res
        .status(400)
        .json({ success: false, error: "Both winnerId and loserId required" });
    if (isNaN(parseInt(winnerId)) || isNaN(parseInt(loserId)))
      return res
        .status(400)
        .json({
          success: false,
          error: "winnerId and loserId must be valid numbers",
        });
    if (winnerId === loserId)
      return res
        .status(400)
        .json({
          success: false,
          error: "Winner and loser can't be the same movie",
        });

    const result = await MovieService.recordComparison(
      parseInt(winnerId),
      parseInt(loserId),
    );
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error recording comparison:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to record comparison",
        message: error.message,
      });
  }
});

// GET /api/movies/:id/history
router.get("/:id/history", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 20;
    if (isNaN(movieId))
      return res.status(400).json({ success: false, error: "Wrong Movie Id" });
    const history = await MovieService.getMovieHistory(movieId, limit);
    res.json({
      success: true,
      data: { history, meta: { movieId, total: history.length, limit } },
    });
  } catch (error) {
    console.error("Error getting movie history:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to get movie history",
        message: error.message,
      });
  }
});

// GET /api/movies/:id
router.get("/:id", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId))
      return res.status(400).json({ success: false, error: "Wrong Movie Id" });
    const movie = await MovieService.getMovieById(movieId);
    if (!movie)
      return res.status(404).json({ success: false, error: "Movie 404" });
    res.json({ success: true, data: movie });
  } catch (error) {
    console.error("Error getting movie:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to get movie details",
        message: error.message,
      });
  }
});

module.exports = router;
