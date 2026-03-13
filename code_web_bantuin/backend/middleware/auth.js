/**
 * Authentication Middleware
 * Verify JWT tokens and protect routes
 */

const jwt = require("jsonwebtoken");

// Verify JWT token
const verifyToken = (req, res, next) => {
  // Get token from header
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Token tidak ditemukan.",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa.",
    });
  }
};

// Check if user has specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak. Role tidak memiliki izin.",
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but continue without user
      req.user = null;
    }
  }

  next();
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth,
};
