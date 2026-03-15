/**
 * Run this once to add performance indexes.
 * Safe to run multiple times (IF NOT EXISTS).
 *
 * Usage: node src/scripts/addIndexes.js
 */
require("dotenv").config();
const db = require("../config/database");

async function addIndexes() {
  console.log("Adding performance indexes...");
  const queries = [
    // Fastest path for ORDER BY RANDOM() LIMIT n — partial index only on active movies
    `CREATE INDEX IF NOT EXISTS idx_movies_random_sampling
     ON movies (id)
     WHERE total_comparisons > 0`,

    // Weighted pair selection uses elo_rating for the diff calculation
    `CREATE INDEX IF NOT EXISTS idx_movies_elo_rating
     ON movies (elo_rating)`,

    // Leaderboard query: WHERE total_comparisons >= N ORDER BY elo_rating DESC
    `CREATE INDEX IF NOT EXISTS idx_movies_leaderboard
     ON movies (total_comparisons, elo_rating DESC)`,

    // Stats query: COUNT(*) FROM comparisons — covering index
    `CREATE INDEX IF NOT EXISTS idx_comparisons_count
     ON comparisons (id)`,

    // Most-compared movie lookup
    `CREATE INDEX IF NOT EXISTS idx_movies_most_compared
     ON movies (total_comparisons DESC)`,
  ];

  for (const q of queries) {
    const name = q.match(/idx_\w+/)?.[0] ?? "?";
    try {
      await db.query(q);
      console.log(`  ✓ ${name}`);
    } catch (e) {
      console.error(`  ✗ ${name}:`, e.message);
    }
  }

  console.log("Done. Run ANALYZE movies; in psql for fresh stats.");
  process.exit(0);
}

addIndexes().catch((e) => {
  console.error(e);
  process.exit(1);
});
