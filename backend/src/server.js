const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const movieRoutes = require("./routes/movies");
const { apiLimiter, comparisonLimiter } = require("./middleware/rateLimiter");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

// CORS — cache preflight for 24h so the browser doesn't fire an OPTIONS
// round-trip before every POST /compare. Without this, each vote costs
// 2 × RTT (OPTIONS + POST) instead of 1 × RTT.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24h preflight cache — eliminates OPTIONS overhead
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/", apiLimiter);
app.use("/api/movies/compare", comparisonLimiter);

// Health check — also used as keep-alive ping target
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  });
});

app.use("/api/movies", movieRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const server = app.listen(PORT, () => {
  console.log(
    `CinemaRank API — port ${PORT} — ${process.env.NODE_ENV || "development"}`,
  );
  console.log(`Health: http://localhost:${PORT}/health`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = app;
