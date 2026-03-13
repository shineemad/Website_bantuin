/**
 * Talent Controller
 * Handle all talent-related operations
 */

const Talent = require("../models/Talent");

class TalentController {
  // Create new talent profile
  static async create(req, res, next) {
    try {
      const userId = req.user.id;
      const talentData = req.body;

      // Only talents can create talent profiles
      if (req.user.role !== "talent" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Hanya talent yang dapat membuat profile",
        });
      }

      const talentId = await Talent.create(userId, talentData);
      const talent = await Talent.findById(talentId);

      res.status(201).json({
        success: true,
        message: "Talent profile berhasil dibuat",
        data: talent,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all talents with filters
  static async getAll(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        experience_level: req.query.experience_level,
        is_available: req.query.is_available,
        search: req.query.search,
        user_id: req.query.user_id,
        limit: req.query.limit,
        offset: req.query.offset,
      };

      const talents = await Talent.getAll(filters);

      res.json({
        success: true,
        data: talents,
        meta: {
          total: talents.length,
          limit: parseInt(filters.limit) || 20,
          offset: parseInt(filters.offset) || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get talent by ID
  static async getById(req, res, next) {
    try {
      const talentId = req.params.id;
      const talent = await Talent.findById(talentId);

      if (!talent) {
        return res.status(404).json({
          success: false,
          message: "Talent tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: talent,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update talent
  static async update(req, res, next) {
    try {
      const talentId = req.params.id;
      const userId = req.user.id;
      const talentData = req.body;

      // Check if talent exists and belongs to user
      const existingTalent = await Talent.findById(talentId);
      if (!existingTalent) {
        return res.status(404).json({
          success: false,
          message: "Talent tidak ditemukan",
        });
      }

      if (existingTalent.user_id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki izin untuk mengubah talent ini",
        });
      }

      const updatedTalent = await Talent.update(talentId, userId, talentData);

      res.json({
        success: true,
        message: "Talent berhasil diperbarui",
        data: updatedTalent,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete talent
  static async delete(req, res, next) {
    try {
      const talentId = req.params.id;
      const userId = req.user.id;

      // Check if talent exists and belongs to user
      const existingTalent = await Talent.findById(talentId);
      if (!existingTalent) {
        return res.status(404).json({
          success: false,
          message: "Talent tidak ditemukan",
        });
      }

      if (existingTalent.user_id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki izin untuk menghapus talent ini",
        });
      }

      await Talent.delete(talentId, userId);

      res.json({
        success: true,
        message: "Talent berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle save talent
  static async toggleSave(req, res, next) {
    try {
      const userId = req.user.id;
      const talentUserId = parseInt(req.params.userId);

      // Check if talent user exists
      const User = require("../models/User");
      const talentUser = await User.findById(talentUserId);
      if (!talentUser) {
        return res.status(404).json({
          success: false,
          message: "Talent user tidak ditemukan",
        });
      }

      if (talentUser.role !== "talent") {
        return res.status(400).json({
          success: false,
          message: "User bukan talent",
        });
      }

      const result = await Talent.toggleSave(userId, talentUserId);

      res.json({
        success: true,
        message: result.saved
          ? "Talent berhasil disimpan"
          : "Talent berhasil dihapus dari simpanan",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get saved talents
  static async getSaved(req, res, next) {
    try {
      const userId = req.user.id;
      const talents = await Talent.getSavedByUser(userId);

      res.json({
        success: true,
        data: talents,
        meta: {
          total: talents.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get my talents (talents created by current user)
  static async getMyTalents(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        user_id: userId,
        limit: req.query.limit,
        offset: req.query.offset,
      };

      const talents = await Talent.getAll(filters);

      res.json({
        success: true,
        data: talents,
        meta: {
          total: talents.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TalentController;
