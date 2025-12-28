/**
 * Elo Rating Calculator for Movie Comparisons
 * Implements symmetric K-factors, smooth decay, and rating bounds
 */

class EloCalculator {
  // Configuration constants
  static RATING_MIN = 800;
  static RATING_MAX = 2200;
  static K_BASE = 40;
  static K_MIN = 20;
  static PAIRING_MAX_DIFF = 500; // Maximum rating difference for pairing

  /**
   * Calculate expected score for a movie against an opponent
   * @param {number} rating - Movie's current rating
   * @param {number} opponentRating - Opponent's current rating
   * @returns {number} Expected score (0 to 1)
   */
  static getExpectedScore(rating, opponentRating) {
    const exponent = (opponentRating - rating) / 400;
    return 1 / (1 + Math.pow(10, exponent));
  }

  /**
   * Determine K-factor with smooth decay based on comparison history
   * Uses exponential decay instead of step functions
   * @param {number} totalComparisons - Number of comparisons so far
   * @returns {number} K-factor (smoothly decays from 40 to 20)
   */
  static getKFactor(totalComparisons) {
    // Smooth exponential decay from K_BASE (40) to K_MIN (20)
    // Formula: K = K_MIN + (K_BASE - K_MIN) * e^(-comparisons/50)
    // At 0 comparisons: K ≈ 40
    // At 50 comparisons: K ≈ 27
    // At 100 comparisons: K ≈ 22
    // At 150+ comparisons: K → 20

    const decayRate = 0.02; // Controls how fast K decreases
    const decay = Math.exp(-decayRate * totalComparisons);
    const k = this.K_MIN + (this.K_BASE - this.K_MIN) * decay;

    return Math.max(this.K_MIN, Math.min(this.K_BASE, k));
  }

  /**
   * Clamp rating to valid range
   * Prevents extreme outliers and keeps system stable
   * @param {number} rating - Raw calculated rating
   * @returns {number} Clamped rating
   */
  static clampRating(rating) {
    return Math.max(this.RATING_MIN, Math.min(this.RATING_MAX, rating));
  }

  /**
   * Calculate new Elo ratings after a comparison
   * Uses symmetric K-factor to preserve rating conservation
   * @param {Object} winner - Winner movie object with rating and total_comparisons
   * @param {Object} loser - Loser movie object with rating and total_comparisons
   * @returns {Object} Updated ratings and metadata
   */
  static calculateNewRatings(winner, loser) {
    // Parse ratings without rounding (maintain precision)
    const winnerRating = parseFloat(winner.elo_rating);
    const loserRating = parseFloat(loser.elo_rating);

    // Calculate expected score for winner (loser is complement)
    const winnerExpected = this.getExpectedScore(winnerRating, loserRating);
    const loserExpected = 1 - winnerExpected; // Mathematical complement

    // Get K-factors for both movies
    const kWinner = this.getKFactor(winner.total_comparisons);
    const kLoser = this.getKFactor(loser.total_comparisons);

    // Use symmetric K-factor (minimum of both) to preserve rating mass
    // This ensures total rating points in system remain constant
    const effectiveK = Math.min(kWinner, kLoser);

    // Calculate rating changes using symmetric K
    // Winner gets 1 point (actual score), loser gets 0
    const winnerChange = effectiveK * (1 - winnerExpected);
    const loserChange = effectiveK * (0 - loserExpected);

    // Calculate new ratings (maintain full precision)
    const rawWinnerRating = winnerRating + winnerChange;
    const rawLoserRating = loserRating + loserChange;

    // Apply rating bounds to prevent extreme outliers
    const newWinnerRating = this.clampRating(rawWinnerRating);
    const newLoserRating = this.clampRating(rawLoserRating);

    return {
      winner: {
        oldRating: winnerRating,
        newRating: newWinnerRating, // Full precision, round only on display
        change: winnerChange,
        kFactor: effectiveK,
        expectedScore: winnerExpected,
      },
      loser: {
        oldRating: loserRating,
        newRating: newLoserRating, // Full precision, round only on display
        change: loserChange,
        kFactor: effectiveK,
        expectedScore: loserExpected,
      },
    };
  }

  /**
   * Calculate pairing weight based on rating difference
   * Uses steeper exponential falloff for better matchmaking
   * @param {number} ratingDiff - Absolute rating difference
   * @returns {number} Weight for pairing probability (0 to 1)
   */
  static getPairingWeight(ratingDiff) {
    const absDiff = Math.abs(ratingDiff);

    // Hard cap: don't pair movies more than PAIRING_MAX_DIFF apart
    if (absDiff > this.PAIRING_MAX_DIFF) {
      return 0;
    }

    // Steeper exponential falloff for better competitive matchups
    // Formula: weight = e^(-diff²/40000)
    // At 0 diff: weight = 1.0
    // At 100 diff: weight ≈ 0.78
    // At 200 diff: weight ≈ 0.37
    // At 300 diff: weight ≈ 0.11
    // At 500 diff: weight = 0

    const normalizedDiff = absDiff / 200;
    return Math.exp(-normalizedDiff * normalizedDiff);
  }
}

module.exports = EloCalculator;
