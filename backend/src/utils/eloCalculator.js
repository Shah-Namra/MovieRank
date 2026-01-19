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

  // Calculate expected score based on current ratings
  // Standard Elo formula
  static getExpectedScore(rating, opponentRating) {
    const exponent = (opponentRating - rating) / 400;
    return 1 / (1 + Math.pow(10, exponent));
  }

  // Determine K-factor with smooth decay based on comparison history
  // Uses exponential decay instead of step functions
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

    const clampedK = Math.max(this.K_MIN, Math.min(this.K_BASE, k));
    return Math.round(clampedK);
  }

  // Clamp rating to valid range
  static clampRating(rating) {
    return Math.max(this.RATING_MIN, Math.min(this.RATING_MAX, rating));
  }

  // New elo calculation with symmetric k factro
  //
  static calculateNewRatings(winner, loser) {
    // Parse ratings without rounding (maintain precision)
    const winnerRating = parseFloat(winner.elo_rating);
    const loserRating = parseFloat(loser.elo_rating);

    // Calculate expected score for winner (loser is complement)
    const winnerExpected = this.getExpectedScore(winnerRating, loserRating);
    const loserExpected = 1 - winnerExpected; // Mathematical complement

    // Get K-factors for both movies (NOW RETURNS INTEGERS)
    const kWinner = this.getKFactor(winner.total_comparisons);
    const kLoser = this.getKFactor(loser.total_comparisons);

    const effectiveK = Math.min(kWinner, kLoser);

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
        kFactor: effectiveK, // NOW AN INTEGER
        expectedScore: winnerExpected,
      },
      loser: {
        oldRating: loserRating,
        newRating: newLoserRating, // Full precision, round only on display
        change: loserChange,
        kFactor: effectiveK, // NOW AN INTEGER
        expectedScore: loserExpected,
      },
    };
  }

  static getPairingWeight(ratingDiff) {
    const absDiff = Math.abs(ratingDiff);

    // Hard cap: don't pair movies more than PAIRING_MAX_DIFF apart
    if (absDiff > this.PAIRING_MAX_DIFF) {
      return 0;
    }

    // Steeper exponential falloff for better competitive matchups
    // Formula: weight = e^(-diff^2/40000)
    // At 0 diff: weight = 1.0
    // At 100 diff: weight = 0.78
    // At 200 diff: weight ~= 0.37
    // At 300 diff: weight ~= 0.11
    // At 500 diff: weight = 0

    const normalizedDiff = absDiff / 200;
    return Math.exp(-normalizedDiff * normalizedDiff);
  }
}

module.exports = EloCalculator;
