const { pool } = require("../config/database");

const setupDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log(" Setting up database schemaz");

    await client.query("BEGIN");

    // Movies table with Elo ratings and metadata
    await client.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        release_year INTEGER,
        poster_path TEXT,
        backdrop_path TEXT,
        overview TEXT,
        elo_rating DECIMAL(10, 2) DEFAULT 1500.00,
        total_comparisons INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Comparisons table for tracking all matchups
    await client.query(`
      CREATE TABLE IF NOT EXISTS comparisons (
        id SERIAL PRIMARY KEY,
        winner_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        loser_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        winner_rating_before DECIMAL(10, 2),
        loser_rating_before DECIMAL(10, 2),
        winner_rating_after DECIMAL(10, 2),
        loser_rating_after DECIMAL(10, 2),
        rating_change DECIMAL(10, 2),
        k_factor_winner INTEGER,
        k_factor_loser INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes for performance optimization
    console.log("Creating indexes....");

    // Leaderboard queries (ORDER BY elo_rating DESC with comparisons filter)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_movies_elo_comparisons 
      ON movies(elo_rating DESC, total_comparisons)
    `);

    // Movie lookup by TMDB ID
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id 
      ON movies(tmdb_id)
    `);

    // Comparison history queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comparisons_winner 
      ON comparisons(winner_id, created_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comparisons_loser 
      ON comparisons(loser_id, created_at DESC)
    `);

    // Timestamp-based queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comparisons_created_at 
      ON comparisons(created_at DESC)
    `);

    // Function to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Trigger to auto-update updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_movies_updated_at ON movies
    `);

    await client.query(`
      CREATE TRIGGER update_movies_updated_at 
      BEFORE UPDATE ON movies 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);

    await client.query("COMMIT");

    console.log("db setup complete!");
    console.log("tables created:");
    console.log("movies (with Elo ratings and metadata)");
    console.log("comparisons (matchup history)");
    console.log("indexes created");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Db setup failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = setupDatabase;
