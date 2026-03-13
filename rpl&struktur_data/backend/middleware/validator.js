/**
 * Request Validation Middleware
 * Using express-validator for input validation
 */

const { body, validationResult } = require("express-validator");

// Handle validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// Validation rules
const validators = {
  // Register validation
  register: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Nama tidak boleh kosong")
      .isLength({ min: 2, max: 255 })
      .withMessage("Nama harus 2-255 karakter"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email tidak boleh kosong")
      .isEmail()
      .withMessage("Format email tidak valid")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password tidak boleh kosong")
      .isLength({ min: 8 })
      .withMessage("Password minimal 8 karakter"),

    body("role")
      .optional()
      .isIn(["client", "talent", "admin"])
      .withMessage("Role tidak valid"),

    body("company")
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage("Company maksimal 255 karakter"),

    body("phone")
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage("Format nomor telepon tidak valid")
      .isLength({ min: 10, max: 20 })
      .withMessage("Nomor telepon 10-20 karakter"),
  ],

  // Login validation
  login: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email tidak boleh kosong")
      .isEmail()
      .withMessage("Format email tidak valid")
      .normalizeEmail(),

    body("password").notEmpty().withMessage("Password tidak boleh kosong"),
  ],

  // Update profile validation
  updateProfile: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage("Nama harus 2-255 karakter"),

    body("phone")
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage("Format nomor telepon tidak valid"),

    body("bio")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Bio maksimal 1000 karakter"),

    body("experience")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Experience level tidak valid"),
  ],

  // Create job validation
  createJob: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Judul pekerjaan tidak boleh kosong")
      .isLength({ min: 3, max: 255 })
      .withMessage("Judul 3-255 karakter"),

    body("company")
      .trim()
      .notEmpty()
      .withMessage("Nama perusahaan tidak boleh kosong")
      .isLength({ max: 255 })
      .withMessage("Nama perusahaan maksimal 255 karakter"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Deskripsi tidak boleh kosong")
      .isLength({ min: 10 })
      .withMessage("Deskripsi minimal 10 karakter"),

    body("job_type")
      .optional()
      .isIn(["full-time", "part-time", "freelance", "contract", "internship"])
      .withMessage("Tipe pekerjaan tidak valid"),

    body("work_mode")
      .optional()
      .isIn(["onsite", "remote", "hybrid"])
      .withMessage("Work mode tidak valid"),
  ],

  // Create talent validation
  createTalent: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Nama skill/service tidak boleh kosong")
      .isLength({ min: 3, max: 255 })
      .withMessage("Nama 3-255 karakter"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Deskripsi tidak boleh kosong")
      .isLength({ min: 10 })
      .withMessage("Deskripsi minimal 10 karakter"),

    body("category")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Kategori maksimal 100 karakter"),

    body("experience_level")
      .optional()
      .isIn(["beginner", "intermediate", "advanced", "expert"])
      .withMessage("Experience level tidak valid"),
  ],
};

module.exports = {
  handleValidation,
  validators,
};
