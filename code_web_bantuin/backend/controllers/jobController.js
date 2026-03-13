/**
 * Job Controller
 * Handle all job-related operations
 */

const Job = require("../models/Job");

class JobController {
  // Create new job
  static async create(req, res, next) {
    try {
      const userId = req.user.id;
      const jobData = req.body;

      // Only clients can create jobs
      if (req.user.role !== "client" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Hanya client yang dapat membuat job posting",
        });
      }

      const jobId = await Job.create(userId, jobData);
      const job = await Job.findById(jobId);

      res.status(201).json({
        success: true,
        message: "Job berhasil dibuat",
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all jobs with filters
  static async getAll(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        job_type: req.query.job_type,
        work_mode: req.query.work_mode,
        location: req.query.location,
        search: req.query.search,
        user_id: req.query.user_id,
        limit: req.query.limit,
        offset: req.query.offset,
      };

      const jobs = await Job.getAll(filters);

      res.json({
        success: true,
        data: jobs,
        meta: {
          total: jobs.length,
          limit: parseInt(filters.limit) || 20,
          offset: parseInt(filters.offset) || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get job by ID
  static async getById(req, res, next) {
    try {
      const jobId = req.params.id;
      const job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update job
  static async update(req, res, next) {
    try {
      const jobId = req.params.id;
      const userId = req.user.id;
      const jobData = req.body;

      // Check if job exists and belongs to user
      const existingJob = await Job.findById(jobId);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: "Job tidak ditemukan",
        });
      }

      if (existingJob.user_id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki izin untuk mengubah job ini",
        });
      }

      const updatedJob = await Job.update(jobId, userId, jobData);

      res.json({
        success: true,
        message: "Job berhasil diperbarui",
        data: updatedJob,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete job
  static async delete(req, res, next) {
    try {
      const jobId = req.params.id;
      const userId = req.user.id;

      // Check if job exists and belongs to user
      const existingJob = await Job.findById(jobId);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: "Job tidak ditemukan",
        });
      }

      if (existingJob.user_id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki izin untuk menghapus job ini",
        });
      }

      await Job.delete(jobId, userId);

      res.json({
        success: true,
        message: "Job berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle save job
  static async toggleSave(req, res, next) {
    try {
      const userId = req.user.id;
      const jobId = req.params.id;

      // Check if job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job tidak ditemukan",
        });
      }

      const result = await Job.toggleSave(userId, jobId);

      res.json({
        success: true,
        message: result.saved
          ? "Job berhasil disimpan"
          : "Job berhasil dihapus dari simpanan",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get saved jobs
  static async getSaved(req, res, next) {
    try {
      const userId = req.user.id;
      const jobs = await Job.getSavedByUser(userId);

      res.json({
        success: true,
        data: jobs,
        meta: {
          total: jobs.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get my jobs (jobs created by current user)
  static async getMyJobs(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = {
        user_id: userId,
        status: req.query.status,
        limit: req.query.limit,
        offset: req.query.offset,
      };

      const jobs = await Job.getAll(filters);

      res.json({
        success: true,
        data: jobs,
        meta: {
          total: jobs.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobController;
