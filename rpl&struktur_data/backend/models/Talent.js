/**
 * Talent Model
 * Handle all talent-related database operations
 */

const { query } = require("../config/database");

class Talent {
  // Create new talent profile
  static async create(userId, talentData) {
    const {
      name,
      description,
      category,
      experience_level,
      skills,
      portfolio_url,
      rate_min,
      rate_max,
      rate_currency,
      rate_period,
      is_available,
    } = talentData;

    const sql = `
      INSERT INTO talents (
        user_id, name, description, category, experience_level,
        skills, portfolio_url,
        rate_min, rate_max, rate_currency, rate_period,
        is_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      userId,
      name,
      description,
      category || null,
      experience_level || "intermediate",
      skills ? JSON.stringify(skills) : null,
      portfolio_url || null,
      rate_min || null,
      rate_max || null,
      rate_currency || "IDR",
      rate_period || "hourly",
      is_available !== undefined ? is_available : true,
    ]);

    return result.insertId;
  }

  // Get talent by ID with user info
  static async findById(id) {
    const sql = `
      SELECT t.*, 
             u.name as user_name,
             u.email as user_email,
             u.phone as user_phone,
             u.location as user_location,
             u.avatar as user_avatar,
             u.bio as user_bio,
             u.experience as user_experience,
             u.skills as user_skills,
             (SELECT COUNT(*) FROM saved_talents WHERE talent_user_id = t.user_id) as saved_count
      FROM talents t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `;

    const talents = await query(sql, [id]);
    if (talents.length === 0) return null;

    const talent = talents[0];
    if (talent.skills) talent.skills = JSON.parse(talent.skills);
    if (talent.user_skills) talent.user_skills = JSON.parse(talent.user_skills);

    return talent;
  }

  // Get all talents with filters
  static async getAll(filters = {}) {
    let sql = `
      SELECT t.*,
             u.name as user_name,
             u.email as user_email,
             u.location as user_location,
             u.avatar as user_avatar,
             (SELECT COUNT(*) FROM saved_talents WHERE talent_user_id = t.user_id) as saved_count
      FROM talents t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by availability
    if (filters.is_available !== undefined) {
      sql += " AND t.is_available = ?";
      params.push(filters.is_available);
    } else {
      sql += " AND t.is_available = TRUE"; // Default to available
    }

    // Filter by category
    if (filters.category) {
      sql += " AND t.category = ?";
      params.push(filters.category);
    }

    // Filter by experience level
    if (filters.experience_level) {
      sql += " AND t.experience_level = ?";
      params.push(filters.experience_level);
    }

    // Search by name or description
    if (filters.search) {
      sql += " AND (t.name LIKE ? OR t.description LIKE ? OR u.name LIKE ?)";
      params.push(
        `%${filters.search}%`,
        `%${filters.search}%`,
        `%${filters.search}%`
      );
    }

    // Filter by user
    if (filters.user_id) {
      sql += " AND t.user_id = ?";
      params.push(filters.user_id);
    }

    sql += " ORDER BY t.created_at DESC";

    // Pagination
    const limit = parseInt(filters.limit) || 20;
    const offset = parseInt(filters.offset) || 0;
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const talents = await query(sql, params);

    // Parse JSON fields
    talents.forEach((talent) => {
      if (talent.skills) talent.skills = JSON.parse(talent.skills);
    });

    return talents;
  }

  // Update talent
  static async update(id, userId, talentData) {
    const {
      name,
      description,
      category,
      experience_level,
      skills,
      portfolio_url,
      rate_min,
      rate_max,
      rate_period,
      is_available,
    } = talentData;

    const sql = `
      UPDATE talents 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          experience_level = COALESCE(?, experience_level),
          skills = COALESCE(?, skills),
          portfolio_url = COALESCE(?, portfolio_url),
          rate_min = COALESCE(?, rate_min),
          rate_max = COALESCE(?, rate_max),
          rate_period = COALESCE(?, rate_period),
          is_available = COALESCE(?, is_available),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `;

    await query(sql, [
      name || null,
      description || null,
      category || null,
      experience_level || null,
      skills ? JSON.stringify(skills) : null,
      portfolio_url || null,
      rate_min || null,
      rate_max || null,
      rate_period || null,
      is_available !== undefined ? is_available : null,
      id,
      userId,
    ]);

    return this.findById(id);
  }

  // Delete talent
  static async delete(id, userId) {
    const sql = "DELETE FROM talents WHERE id = ? AND user_id = ?";
    await query(sql, [id, userId]);
  }

  // Save/unsave talent
  static async toggleSave(userId, talentUserId) {
    // Check if already saved
    const checkSql =
      "SELECT id FROM saved_talents WHERE user_id = ? AND talent_user_id = ?";
    const existing = await query(checkSql, [userId, talentUserId]);

    if (existing.length > 0) {
      // Unsave
      const deleteSql =
        "DELETE FROM saved_talents WHERE user_id = ? AND talent_user_id = ?";
      await query(deleteSql, [userId, talentUserId]);
      return { saved: false };
    } else {
      // Save
      const insertSql =
        "INSERT INTO saved_talents (user_id, talent_user_id) VALUES (?, ?)";
      await query(insertSql, [userId, talentUserId]);
      return { saved: true };
    }
  }

  // Get saved talents by user
  static async getSavedByUser(userId) {
    const sql = `
      SELECT u.id as user_id,
             u.name,
             u.email,
             u.phone,
             u.bio,
             u.experience,
             u.skills as user_skills,
             u.location,
             u.avatar,
             st.saved_at,
             (SELECT COUNT(*) FROM talents WHERE user_id = u.id) as talents_count
      FROM saved_talents st
      JOIN users u ON st.talent_user_id = u.id
      WHERE st.user_id = ?
      ORDER BY st.saved_at DESC
    `;

    const talents = await query(sql, [userId]);

    talents.forEach((talent) => {
      if (talent.user_skills)
        talent.user_skills = JSON.parse(talent.user_skills);
    });

    return talents;
  }

  // Get talents count by user
  static async getCountByUser(userId) {
    const sql = "SELECT COUNT(*) as count FROM talents WHERE user_id = ?";
    const result = await query(sql, [userId]);
    return result[0].count;
  }
}

module.exports = Talent;
