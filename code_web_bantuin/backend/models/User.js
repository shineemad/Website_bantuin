/**
 * User Model
 * Handle all user-related database operations
 */

const { query } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  // Create new user
  static async create(userData) {
    const {
      name,
      email,
      password,
      role = "client",
      company,
      phone,
      bio,
      experience,
      skills,
    } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, role, company, phone, bio, experience, skills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name,
      email,
      hashedPassword,
      role,
      company || null,
      phone || null,
      bio || null,
      experience || null,
      skills ? JSON.stringify(skills) : null,
    ]);

    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const users = await query(sql, [email]);

    if (users.length === 0) return null;

    const user = users[0];
    // Parse JSON fields
    if (user.skills) user.skills = JSON.parse(user.skills);

    return user;
  }

  // Find user by ID
  static async findById(id) {
    const sql = "SELECT * FROM users WHERE id = ?";
    const users = await query(sql, [id]);

    if (users.length === 0) return null;

    const user = users[0];
    if (user.skills) user.skills = JSON.parse(user.skills);

    return user;
  }

  // Update user profile
  static async update(id, userData) {
    const { name, phone, bio, experience, skills, company, location, avatar } =
      userData;

    const sql = `
      UPDATE users 
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          bio = COALESCE(?, bio),
          experience = COALESCE(?, experience),
          skills = COALESCE(?, skills),
          company = COALESCE(?, company),
          location = COALESCE(?, location),
          avatar = COALESCE(?, avatar),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await query(sql, [
      name || null,
      phone || null,
      bio || null,
      experience || null,
      skills ? JSON.stringify(skills) : null,
      company || null,
      location || null,
      avatar || null,
      id,
    ]);

    return this.findById(id);
  }

  // Update last login
  static async updateLastLogin(id) {
    const sql =
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?";
    await query(sql, [id]);
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user without password
  static sanitizeUser(user) {
    if (!user) return null;

    const { password, ...sanitized } = user;
    return sanitized;
  }

  // Check if email exists
  static async emailExists(email) {
    const sql = "SELECT COUNT(*) as count FROM users WHERE email = ?";
    const result = await query(sql, [email]);
    return result[0].count > 0;
  }

  // Get all users (admin only)
  static async getAll(filters = {}) {
    let sql =
      "SELECT id, name, email, role, company, phone, is_active, created_at FROM users WHERE 1=1";
    const params = [];

    if (filters.role) {
      sql += " AND role = ?";
      params.push(filters.role);
    }

    if (filters.is_active !== undefined) {
      sql += " AND is_active = ?";
      params.push(filters.is_active);
    }

    sql += " ORDER BY created_at DESC";

    if (filters.limit) {
      sql += " LIMIT ? OFFSET ?";
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    return await query(sql, params);
  }

  // Delete user
  static async delete(id) {
    const sql = "DELETE FROM users WHERE id = ?";
    await query(sql, [id]);
  }
}

module.exports = User;
