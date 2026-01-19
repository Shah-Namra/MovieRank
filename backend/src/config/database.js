const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 10, // Limits Max Connections
        idleTimeoutMillis: 20000,
        connectionTimeoutMillis: 10000,
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
      },
);

// Test database connection
pool.on("connect", (client) => {
  console.log("DB connected successfully");
});

pool.on("error", (err, client) => {
  console.error("Unexpected db error:", err);
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
