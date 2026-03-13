/**
 * Authentication Routes
 * /api/auth/*
 */

const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const { validators, handleValidation } = require("../middleware/validator");

// Public routes
router.post(
  "/register",
  validators.register,
  handleValidation,
  AuthController.register
);
router.post("/login", validators.login, handleValidation, AuthController.login);

// Protected routes
router.get("/profile", verifyToken, AuthController.getProfile);
router.put(
  "/profile",
  verifyToken,
  validators.updateProfile,
  handleValidation,
  AuthController.updateProfile
);
router.post("/change-password", verifyToken, AuthController.changePassword);
router.post("/logout", verifyToken, AuthController.logout);
router.get("/verify", verifyToken, AuthController.verifyToken);

module.exports = router;
