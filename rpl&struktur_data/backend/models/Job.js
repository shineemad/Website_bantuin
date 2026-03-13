/**
 * Job Model
 * Handle all job-related database operations
 */

const { query } = require("../config/database");

class Job {
  // Create new job
  static async create(userId, jobData) {
    const {
      title,
      company,
      description,
      requirements,
      location,
      job_type,
      work_mode,
      salary_min,
      salary_max,
      salary_currency,
      salary_period,
      skills_required,
      status,
      expires_at,
    } = jobData;

    const sql = `
      INSERT INTO jobs (
        user_id, title, company, description, requirements,
        location, job_type, work_mode,
        salary_min, salary_max, salary_currency, salary_period,
        skills_required, status, expires_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const result = await query(sql, [
      userId,
      title,
      company,
      description || null,
      requirements || null,
      location || null,
      job_type || "full-time",
      work_mode || "onsite",
      salary_min || null,
      salary_max || null,
      salary_currency || "IDR",
      salary_period || "monthly",
      skills_required ? JSON.stringify(skills_required) : null,
      status || "open",
      expires_at || null,
    ]);

    return result.insertId;
  }

  // Get job by ID with user info
  static async findById(id) {
    const sql = `
      SELECT j.*, 
             u.name as poster_name, 
             u.email as poster_email,
             u.company as poster_company,
             (SELECT COUNT(*) FROM saved_jobs WHERE job_id = j.id) as saved_count,
             (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as application_count
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE j.id = ?
    `;

    const jobs = await query(sql, [id]);
    if (jobs.length === 0) return null;

    const job = jobs[0];
    if (job.skills_required)
      job.skills_required = JSON.parse(job.skills_required);

    return job;
  }

  // Get all jobs with filters
  static async getAll(filters = {}) {
    let sql = `
      SELECT j.*, 
             u.name as poster_name,
             u.company as poster_company,
             (SELECT COUNT(*) FROM saved_jobs WHERE job_id = j.id) as saved_count,
             (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as application_count
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status
    if (filters.status) {
      sql += " AND j.status = ?";
      params.push(filters.status);
    } else {
      sql += " AND j.status = ?"; // Default to open jobs
      params.push("open");
    }

    // Filter by job type
    if (filters.job_type) {
      sql += " AND j.job_type = ?";
      params.push(filters.job_type);
    }

    // Filter by work mode
    if (filters.work_mode) {
      sql += " AND j.work_mode = ?";
      params.push(filters.work_mode);
    }

    // Filter by location
    if (filters.location) {
      sql += " AND j.location LIKE ?";
      params.push(`%${filters.location}%`);
    }

    // Search by title or company
    if (filters.search) {
      sql +=
        " AND (j.title LIKE ? OR j.company LIKE ? OR j.description LIKE ?)";
      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`
      );
    }

    // Filter by user
    if (filters.user_id) {
      sql += " AND j.user_id = ?";
      params.push(filters.user_id);
    }

    sql += " ORDER BY j.created_at DESC";

    // Pagination
    const limit = parseInt(filters.limit) || 20;
    const offset = parseInt(filters.offset) || 0;
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const jobs = await query(sql, params);

    // Parse JSON fields
    jobs.forEach((job) => {
      if (job.skills_required)
        job.skills_required = JSON.parse(job.skills_required);
    });

    return jobs;
  }

  // Update job
  static async update(id, userId, jobData) {
    const {
      title,
      company,
      description,
      requirements,
      location,
      job_type,
      work_mode,
      salary_min,
      salary_max,
      skills_required,
      status,
      expires_at,
    } = jobData;

    const sql = `
      UPDATE jobs 
      SET title = COALESCE(?, title),
          company = COALESCE(?, company),
          description = COALESCE(?, description),
          requirements = COALESCE(?, requirements),
          location = COALESCE(?, location),
          job_type = COALESCE(?, job_type),
          work_mode = COALESCE(?, work_mode),
          salary_min = COALESCE(?, salary_min),
          salary_max = COALESCE(?, salary_max),
          skills_required = COALESCE(?, skills_required),
          status = COALESCE(?, status),
          expires_at = COALESCE(?, expires_at),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    await query(sql, [
      title || null,
      company || null,
      description || null,
      requirements || null,
      location || null,
      job_type || null,
      work_mode || null,
      salary_min || null,
      salary_max || null,
      skills_required ? JSON.stringify(skills_required) : null,
      status || null,
      expires_at || null,
      id,
      userId,
    ]);

    return this.findById(id);
  }

  // Delete job
  static async delete(id, userId) {
    const sql = "DELETE FROM jobs WHERE id = ? AND user_id = ?";
    await query(sql, [id, userId]);
  }

  // Save/unsave job
  static async toggleSave(userId, jobId) {
    // Check if already saved
    const checkSql =
      "SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?";
    const existing = await query(checkSql, [userId, jobId]);

    if (existing.length > 0) {
      // Unsave
      const deleteSql =
        "DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?";
      await query(deleteSql, [userId, jobId]);
      return { saved: false };
    } else {
      // Save
      const insertSql =
        "INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)";
      await query(insertSql, [userId, jobId]);
      return { saved: true };
    }
  }

  // Get saved jobs by user
  static async getSavedByUser(userId, filters = {}) {
    const sql = `
      SELECT j.*, 
             u.name as poster_name,
             u.company as poster_company,
             sj.saved_at,
             (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as application_count
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN users u ON j.user_id = u.id
      WHERE sj.user_id = ?
      ORDER BY sj.saved_at DESC
    `;

    const jobs = await query(sql, [userId]);

    jobs.forEach((job) => {
      if (job.skills_required)
        job.skills_required = JSON.parse(job.skills_required);
    });

    return jobs;
  }

  // Get jobs count by user
  static async getCountByUser(userId) {
    const sql = "SELECT COUNT(*) as count FROM jobs WHERE user_id = ?";
    const result = await query(sql, [userId]);
    return result[0].count;
  }
}

module.exports = Job;
