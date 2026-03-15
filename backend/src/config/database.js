const { Pool } = require("pg");
require("dotenv").config();

const isProduction = !!process.env.DATABASE_URL;

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        // OPTIMIZATION: Reduce idle timeout — frees connections faster on hobby plans
        idleTimeoutMillis: 10000,
        // OPTIMIZATION: Tighter connection timeout — fail fast rather than hang
        connectionTimeoutMillis: 5000,
        // Keep-alive prevents cold connections on Render/Railway free tiers
        keepAlive: true,
        keepAliveInitialDelayMillis: 5000,
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 2000,
      },
);

pool.on("connect", () => console.log("DB connected"));
pool.on("error", (err) => console.error("Unexpected DB error:", err));

// OPTIMIZATION: Warm up a connection on startup so the first request isn't cold
pool
  .connect()
  .then((client) => {
    client.query("SELECT 1"); // Ping — keeps the connection warm
    client.release();
    console.log("DB connection warmed up");
  })
  .catch((err) => console.error("Warmup failed (non-fatal):", err.message));

module.exports = {
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const ms = Date.now() - start;
      // Only log slow queries (>100ms) in production to reduce noise
      if (ms > 100 || !isProduction) {
        console.log("query", {
          ms,
          rows: res.rowCount,
          sql: text.substring(0, 60),
        });
      }
      return res;
    } catch (error) {
      console.error("Query error:", {
        sql: text.substring(0, 60),
        error: error.message,
      });
      throw error;
    }
  },
  pool,
};
