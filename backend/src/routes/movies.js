const express = require("express");
const router = express.Router();
const MovieService = require("../services/movieService");

// GET /api/movies/pair
// random pair of movies for comparison
router.get("/pair", async (req, res) => {
  try {
    const pair = await MovieService.getRandomPair();
    res.json({
      success: true,
      data: pair,
    });
  } catch (error) {
    console.error("Error getting movie pair:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get movie pair",
      message: error.message,
    });
  }
});

// POST /api/movies/compare
// Recording comparison b/w two movies
// Body: {winnerId, loserId }
router.post("/compare", async (req, res) => {
  try {
    const { winnerId, loserId } = req.body;

    // Validation
    if (!winnerId || !loserId) {
      return res.status(400).json({
        success: false,
        error: "Both winnerId and loserId required",
      });
    }

    if (winnerId === loserId) {
      return res.status(400).json({
        success: false,
        error: "Winner loser cant be same movie",
      });
    }

    const result = await MovieService.recordComparison(
      parseInt(winnerId),
      parseInt(loserId)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error recording comparison:", error);
    res.status(500).json({
      success: false,
      error: "Failed to record comparison",
      message: error.message,
    });
  }
});

// GET /api/movies/leaderboard
// Geting top-ranked movies
// Query params: limit (default 50), minComparisons (default 20)
router.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const minComparisons =
      parseInt(req.query.minComparisons) ||
      parseInt(process.env.MIN_COMPARISONS_FOR_LEADERBOARD) ||
      20;

    const leaderboard = await MovieService.getLeaderboard(
      limit,
      minComparisons
    );

    res.json({
      success: true,
      data: {
        movies: leaderboard,
        meta: {
          total: leaderboard.length,
          minComparisons,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get leaderboard",
      message: error.message,
    });
  }
});

// GET /api/movies/:id
// Get details for a specific movie
router.get("/:id", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);

    if (isNaN(movieId)) {
      return res.status(400).json({
        success: false,
        error: "Wrong Movie Id",
      });
    }

    const movie = await MovieService.getMovieById(movieId);

    if (!movie) {
      return res.status(404).json({
        success: false,
        error: "Movie 404",
      });
    }

    res.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    console.error("Error getting movie:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get movie details",
      message: error.message,
    });
  }
});

// GET /api/movies/:id/history
// Get comparison history for a movie
// Query params: limit (default 20)
router.get("/:id/history", async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 20;

    if (isNaN(movieId)) {
      return res.status(400).json({
        success: false,
        error: "Wrong Movie Id",
      });
    }

    const history = await MovieService.getMovieHistory(movieId, limit);

    res.json({
      success: true,
      data: {
        history,
        meta: {
          movieId,
          total: history.length,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error getting movie history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get movie history",
      message: error.message,
    });
  }
});

module.exports = router;
