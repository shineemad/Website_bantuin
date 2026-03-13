/**
 * Authentication Controller
 * Handle register, login, logout, profile operations
 */

const User = require("../models/User");
const jwt = require("jsonwebtoken");

class AuthController {
  // Register new user
  static async register(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        role,
        company,
        phone,
        bio,
        experience,
        skills,
      } = req.body;

      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email sudah terdaftar",
        });
      }

      // Create user
      const userId = await User.create({
        name,
        email,
        password,
        role: role || "client",
        company,
        phone,
        bio,
        experience,
        skills,
      });

      // Get created user (without password)
      const user = await User.findById(userId);
      const sanitizedUser = User.sanitizeUser(user);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      res.status(201).json({
        success: true,
        message: "Registrasi berhasil",
        data: {
          user: sanitizedUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
      }

      // Verify password
      const isPasswordValid = await User.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
      }

      // Check if account is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: "Akun Anda telah dinonaktifkan",
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Sanitize user data
      const sanitizedUser = User.sanitizeUser(user);

      res.json({
        success: true,
        message: "Login berhasil",
        data: {
          user: sanitizedUser,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      const sanitizedUser = User.sanitizeUser(user);

      res.json({
        success: true,
        data: sanitizedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        name,
        phone,
        bio,
        experience,
        skills,
        company,
        location,
        avatar,
      } = req.body;

      const updatedUser = await User.update(userId, {
        name,
        phone,
        bio,
        experience,
        skills,
        company,
        location,
        avatar,
      });

      const sanitizedUser = User.sanitizeUser(updatedUser);

      res.json({
        success: true,
        message: "Profil berhasil diperbarui",
        data: sanitizedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Validation
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Password lama dan password baru harus diisi",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password baru minimal 8 karakter",
        });
      }

      // Get user
      const user = await User.findById(userId);

      // Verify current password
      const isValid = await User.verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Password lama tidak sesuai",
        });
      }

      // Hash new password
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const { query } = require("../config/database");
      await query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      res.json({
        success: true,
        message: "Password berhasil diubah",
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout (client-side only - just remove token)
  static async logout(req, res) {
    res.json({
      success: true,
      message: "Logout berhasil",
    });
  }

  // Verify token (check if token is valid)
  static async verifyToken(req, res) {
    res.json({
      success: true,
      message: "Token valid",
      data: {
        user: req.user,
      },
    });
  }
}

module.exports = AuthController;
