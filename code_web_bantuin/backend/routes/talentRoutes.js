/**
 * Talent Routes
 * /api/talents/*
 */

const express = require("express");
const router = express.Router();
const TalentController = require("../controllers/talentController");
const { verifyToken, requireRole } = require("../middleware/auth");
const { validators, handleValidation } = require("../middleware/validator");

// Public routes
router.get("/", TalentController.getAll);
router.get("/:id", TalentController.getById);

// Protected routes
router.post(
  "/",
  verifyToken,
  requireRole("talent", "admin"),
  validators.createTalent,
  handleValidation,
  TalentController.create
);
router.put(
  "/:id",
  verifyToken,
  validators.createTalent,
  handleValidation,
  TalentController.update
);
router.delete("/:id", verifyToken, TalentController.delete);

// Save/unsave talent
router.post("/user/:userId/save", verifyToken, TalentController.toggleSave);

// Get saved talents
router.get("/saved/list", verifyToken, TalentController.getSaved);

// Get my talents
router.get("/my/list", verifyToken, TalentController.getMyTalents);

module.exports = router;
