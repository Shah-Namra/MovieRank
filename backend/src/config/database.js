const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL connection pool for efficient connection management
// Supports both DATABASE_URL (Neon, Supabase) and individual parameters
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false, // Required for most cloud PostgreSQL providers
        },
        max: 10, // Reduced pool size for serverless
        idleTimeoutMillis: 20000, // Close idle connections faster
        connectionTimeoutMillis: 10000, // Increase connection timeout
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

// Test database connection
pool.on("connect", (client) => {
  console.log("Database connected successfully");
});

pool.on("error", (err, client) => {
  console.error("Unexpected database error:", err);
});

// Handle connection errors gracefully
pool.on("remove", () => {
  console.log("Client removed from pool");
});

module.exports = {
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log("Executed query", {
        text: text.substring(0, 50),
        duration,
        rows: res.rowCount,
      });
      return res;
    } catch (error) {
      console.error("Query error:", {
        text: text.substring(0, 50),
        error: error.message,
      });
      throw error;
    }
  },
  pool,
};
