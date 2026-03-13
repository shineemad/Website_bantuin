/**
 * Bantu.in Backend API Server
 * Main entry point
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import database
const { testConnection } = require("./config/database");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const talentRoutes = require("./routes/talentRoutes");

// Import middleware
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Terlalu banyak request, coba lagi nanti",
  },
});
app.use("/api/", limiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bantu.in API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Bantu.in API v1.0",
    endpoints: {
      auth: "/api/auth",
      jobs: "/api/jobs",
      talents: "/api/talents",
    },
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/talents", talentRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error(
        "⚠️  Failed to connect to database. Please check your configuration."
      );
      console.log("💡 Make sure to:");
      console.log("   1. Copy .env.example to .env");
      console.log("   2. Update database credentials in .env");
      console.log("   3. Run the schema.sql file to create tables");
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API Endpoints:`);
      console.log(`   - Auth:    http://localhost:${PORT}/api/auth`);
      console.log(`   - Jobs:    http://localhost:${PORT}/api/jobs`);
      console.log(`   - Talents: http://localhost:${PORT}/api/talents`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
