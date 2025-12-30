const rateLimit = require("express-rate-limit");

// API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: "Too many requests, wait...",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for comparison endpoint
const comparisonLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // 30 comparison/min
  message: {
    success: false,
    error: "Too many comparisons, slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  comparisonLimiter,
};
