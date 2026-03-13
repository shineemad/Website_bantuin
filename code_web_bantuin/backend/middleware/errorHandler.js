/**
 * Global Error Handler Middleware
 * Catch and format errors consistently
 */

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Terjadi kesalahan pada server";

  // MySQL errors
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Data sudah ada (duplicate entry)";

    if (err.sqlMessage?.includes("email")) {
      message = "Email sudah terdaftar";
    }
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 404;
    message = "Data yang direferensikan tidak ditemukan";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token tidak valid";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token sudah kadaluarsa";
  }

  // Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validasi gagal";
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

// 404 Not Found handler
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan`,
  });
};

module.exports = {
  errorHandler,
  notFound,
};
