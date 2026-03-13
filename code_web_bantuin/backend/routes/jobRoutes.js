/**
 * Job Routes
 * /api/jobs/*
 */

const express = require("express");
const router = express.Router();
const JobController = require("../controllers/jobController");
const { verifyToken, requireRole } = require("../middleware/auth");
const { validators, handleValidation } = require("../middleware/validator");

// Public routes (with optional auth)
router.get("/", JobController.getAll);
router.get("/:id", JobController.getById);

// Protected routes
router.post(
  "/",
  verifyToken,
  requireRole("client", "admin"),
  validators.createJob,
  handleValidation,
  JobController.create
);
router.put(
  "/:id",
  verifyToken,
  validators.createJob,
  handleValidation,
  JobController.update
);
router.delete("/:id", verifyToken, JobController.delete);

// Save/unsave job
router.post("/:id/save", verifyToken, JobController.toggleSave);

// Get saved jobs
router.get("/saved/list", verifyToken, JobController.getSaved);

// Get my jobs
router.get("/my/list", verifyToken, JobController.getMyJobs);

module.exports = router;
