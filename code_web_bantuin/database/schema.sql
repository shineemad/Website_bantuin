-- ============================================
-- BANTU.IN DATABASE SCHEMA
-- Database: MySQL 8.0+ / PostgreSQL 13+
-- Created: November 30, 2025
-- Description: Complete database schema for bantu.in job marketplace platform
-- ============================================

-- Drop tables if exists (for clean installation)
DROP TABLE IF EXISTS error_logs;
DROP TABLE IF EXISTS saved_talents;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS talents;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- ============================================
-- TABLE: users
-- Description: Main user accounts table
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'Hashed password using bcrypt',
    role ENUM('client', 'talent', 'admin') NOT NULL DEFAULT 'client',
    
    -- Profile Information
    company VARCHAR(255) DEFAULT NULL COMMENT 'For client accounts',
    phone VARCHAR(20) DEFAULT NULL,
    bio TEXT DEFAULT NULL COMMENT 'User biography/description',
    experience VARCHAR(50) DEFAULT NULL COMMENT 'Experience level for talents',
    skills JSON DEFAULT NULL COMMENT 'Array of skills for talents',
    avatar TEXT DEFAULT NULL COMMENT 'Base64 image or URL',
    
    -- Location
    location VARCHAR(255) DEFAULT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: jobs
-- Description: Job postings created by clients
-- ============================================
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Client who posted the job',
    
    -- Job Details
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT DEFAULT NULL,
    
    -- Job Information
    location VARCHAR(255) DEFAULT NULL,
    job_type ENUM('full-time', 'part-time', 'freelance', 'contract', 'internship') DEFAULT 'full-time',
    work_mode ENUM('onsite', 'remote', 'hybrid') DEFAULT 'onsite',
    
    -- Compensation
    salary_min DECIMAL(15, 2) DEFAULT NULL,
    salary_max DECIMAL(15, 2) DEFAULT NULL,
    salary_currency VARCHAR(10) DEFAULT 'IDR',
    salary_period ENUM('hourly', 'daily', 'monthly', 'yearly', 'project') DEFAULT 'monthly',
    
    -- Skills Required (JSON array)
    skills_required JSON DEFAULT NULL,
    
    -- Status
    status ENUM('draft', 'open', 'closed', 'filled') DEFAULT 'open',
    expires_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL DEFAULT NULL,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_job_type (job_type),
    INDEX idx_created_at (created_at),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: talents
-- Description: Talent profiles/portfolios (skills offered by users)
-- ============================================
CREATE TABLE talents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Talent user who created this profile',
    
    -- Talent Details
    name VARCHAR(255) NOT NULL COMMENT 'Skill name or service offered',
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT NULL COMMENT 'e.g., Design, Development, Marketing',
    
    -- Experience & Skills
    experience_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    skills JSON DEFAULT NULL COMMENT 'Related skills array',
    
    -- Portfolio
    portfolio_url TEXT DEFAULT NULL,
    
    -- Pricing (optional)
    rate_min DECIMAL(15, 2) DEFAULT NULL,
    rate_max DECIMAL(15, 2) DEFAULT NULL,
    rate_currency VARCHAR(10) DEFAULT 'IDR',
    rate_period ENUM('hourly', 'daily', 'project') DEFAULT 'hourly',
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_category (category),
    INDEX idx_is_available (is_available),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: saved_jobs
-- Description: User's saved/bookmarked jobs
-- ============================================
CREATE TABLE saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    
    -- Timestamps
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Unique constraint: user can save same job only once
    UNIQUE KEY unique_user_job (user_id, job_id),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_job_id (job_id),
    INDEX idx_saved_at (saved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: saved_talents
-- Description: Client's saved/bookmarked talents
-- ============================================
CREATE TABLE saved_talents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Client who saved the talent',
    talent_user_id INT NOT NULL COMMENT 'Talent user who was saved',
    
    -- Timestamps
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint: client can save same talent only once
    UNIQUE KEY unique_user_talent (user_id, talent_user_id),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_talent_user_id (talent_user_id),
    INDEX idx_saved_at (saved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: job_applications
-- Description: Talent applications to job postings
-- ============================================
CREATE TABLE job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL COMMENT 'Talent who applied',
    
    -- Application Details
    cover_letter TEXT DEFAULT NULL,
    resume_url TEXT DEFAULT NULL,
    portfolio_url TEXT DEFAULT NULL,
    
    -- Status
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    
    -- Notes
    notes TEXT DEFAULT NULL COMMENT 'Notes from client/HR',
    
    -- Timestamps
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint: user can apply to same job only once
    UNIQUE KEY unique_job_user (job_id, user_id),
    
    -- Indexes
    INDEX idx_job_id (job_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_applied_at (applied_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: sessions
-- Description: User session tokens (JWT or session-based auth)
-- ============================================
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE COMMENT 'JWT token or session ID',
    
    -- Session Info
    ip_address VARCHAR(50) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    
    -- Expiration
    expires_at TIMESTAMP NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: error_logs
-- Description: Application error logging
-- ============================================
CREATE TABLE error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL COMMENT 'User who encountered the error (if logged in)',
    
    -- Error Details
    context VARCHAR(255) NOT NULL COMMENT 'Where the error occurred',
    error_message TEXT NOT NULL,
    stack_trace TEXT DEFAULT NULL,
    
    -- Request Info
    url TEXT DEFAULT NULL,
    method VARCHAR(10) DEFAULT NULL COMMENT 'GET, POST, etc.',
    ip_address VARCHAR(50) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_context (context)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA / SEED DATA
-- ============================================

-- Insert Admin User (password: admin123 - MUST BE HASHED IN PRODUCTION!)
INSERT INTO users (name, email, password, role, is_active, is_verified, email_verified_at) VALUES
('Admin Bantu.in', 'admin@bantuin.com', '$2b$10$YourHashedPasswordHere', 'admin', TRUE, TRUE, NOW());

-- Insert Test Client (password: client123 - MUST BE HASHED IN PRODUCTION!)
INSERT INTO users (name, email, password, role, company, phone, is_active, is_verified) VALUES
('Budi Santoso', 'client@test.com', '$2b$10$YourHashedPasswordHere', 'client', 'PT Maju Jaya', '081234567890', TRUE, TRUE);

-- Insert Test Talent (password: talent123 - MUST BE HASHED IN PRODUCTION!)
INSERT INTO users (name, email, password, role, phone, bio, experience, skills, is_active, is_verified) VALUES
('Siti Nurhaliza', 'talent@test.com', '$2b$10$YourHashedPasswordHere', 'talent', '081234567891', 
'Full-stack developer dengan 5 tahun pengalaman dalam membangun aplikasi web modern.', 
'advanced',
'["Web Development", "UI/UX Design", "React", "Node.js", "JavaScript", "MySQL"]',
TRUE, TRUE);

-- Insert Sample Jobs
INSERT INTO jobs (user_id, title, company, description, requirements, location, job_type, work_mode, salary_min, salary_max, salary_currency, salary_period, skills_required, status, published_at) VALUES
(2, 'Full Stack Developer', 'PT Maju Jaya', 'Mencari Full Stack Developer berpengalaman untuk mengembangkan aplikasi web enterprise.', 
'- Minimal 2 tahun pengalaman\n- Menguasai React dan Node.js\n- Familiar dengan database MySQL', 
'Jakarta', 'full-time', 'hybrid', 8000000, 12000000, 'IDR', 'monthly',
'["React", "Node.js", "MySQL", "REST API"]', 
'open', NOW()),

(2, 'UI/UX Designer', 'PT Maju Jaya', 'Kami mencari UI/UX Designer kreatif untuk merancang interface aplikasi mobile dan web.', 
'- Portfolio design yang kuat\n- Menguasai Figma\n- Pengalaman 1-3 tahun', 
'Bandung', 'full-time', 'remote', 6000000, 9000000, 'IDR', 'monthly',
'["Figma", "Adobe XD", "UI Design", "UX Research"]',
'open', NOW()),

(2, 'Content Writer Freelance', 'PT Maju Jaya', 'Membutuhkan content writer untuk artikel blog dan social media.', 
'- Menulis artikel SEO friendly\n- Kreatif dan konsisten', 
'Remote', 'freelance', 'remote', 500000, 1000000, 'IDR', 'project',
'["Content Writing", "SEO", "Copywriting"]',
'open', NOW());

-- Insert Sample Talents
INSERT INTO talents (user_id, name, description, category, experience_level, skills, portfolio_url, rate_min, rate_max, rate_currency, rate_period, is_available) VALUES
(3, 'Web Development Services', 'Saya menawarkan jasa pembuatan website profesional menggunakan teknologi terkini seperti React, Node.js, dan database MySQL. Berpengalaman dalam membangun aplikasi web full-stack dengan performa tinggi.', 
'Development', 'advanced', 
'["React", "Node.js", "Express", "MySQL", "MongoDB", "REST API", "JavaScript", "TypeScript"]',
'https://portfolio.sitinurhaliza.com', 
150000, 250000, 'IDR', 'hourly', TRUE),

(3, 'UI/UX Design Consultant', 'Desain interface yang menarik dan user-friendly untuk aplikasi web dan mobile. Meliputi user research, wireframing, prototyping hingga final design.', 
'Design', 'advanced',
'["Figma", "Adobe XD", "Sketch", "UI Design", "UX Research", "Prototyping"]',
'https://behance.net/sitinurhaliza', 
100000, 200000, 'IDR', 'hourly', TRUE);

-- ============================================
-- VIEWS (Optional - for easier queries)
-- ============================================

-- View: Active Jobs with User Info
CREATE OR REPLACE VIEW v_active_jobs AS
SELECT 
    j.*,
    u.name as poster_name,
    u.company as poster_company,
    u.email as poster_email,
    (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as application_count,
    (SELECT COUNT(*) FROM saved_jobs WHERE job_id = j.id) as saved_count
FROM jobs j
JOIN users u ON j.user_id = u.id
WHERE j.status = 'open';

-- View: Talent Profiles with Stats
CREATE OR REPLACE VIEW v_talent_profiles AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.bio,
    u.experience,
    u.skills as user_skills,
    u.location,
    u.avatar,
    t.id as talent_id,
    t.name as talent_name,
    t.description,
    t.category,
    t.experience_level,
    t.skills as talent_skills,
    t.portfolio_url,
    t.rate_min,
    t.rate_max,
    t.rate_currency,
    t.rate_period,
    t.is_available,
    (SELECT COUNT(*) FROM saved_talents WHERE talent_user_id = u.id) as saved_count
FROM users u
LEFT JOIN talents t ON u.id = t.user_id
WHERE u.role = 'talent' AND u.is_active = TRUE;

-- ============================================
-- STORED PROCEDURES (Optional)
-- ============================================

DELIMITER //

-- Procedure: Get User Dashboard Stats
CREATE PROCEDURE sp_get_user_stats(IN p_user_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM jobs WHERE user_id = p_user_id) as total_jobs,
        (SELECT COUNT(*) FROM jobs WHERE user_id = p_user_id AND status = 'open') as open_jobs,
        (SELECT COUNT(*) FROM talents WHERE user_id = p_user_id) as total_talents,
        (SELECT COUNT(*) FROM saved_jobs WHERE user_id = p_user_id) as saved_jobs_count,
        (SELECT COUNT(*) FROM saved_talents WHERE user_id = p_user_id) as saved_talents_count,
        (SELECT COUNT(*) FROM job_applications WHERE user_id = p_user_id) as applications_count;
END //

-- Procedure: Clean Expired Sessions
CREATE PROCEDURE sp_clean_expired_sessions()
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    SELECT ROW_COUNT() as deleted_sessions;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS (Optional - for audit trail)
-- ============================================

-- Trigger: Update user's last_login_at on session creation
DELIMITER //
CREATE TRIGGER tr_update_last_login 
AFTER INSERT ON sessions
FOR EACH ROW
BEGIN
    UPDATE users SET last_login_at = NOW() WHERE id = NEW.user_id;
END //
DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at DESC);
CREATE INDEX idx_jobs_location_type ON jobs(location, job_type);
CREATE INDEX idx_talents_category_available ON talents(category, is_available);
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- Full-text search indexes (if supported)
-- ALTER TABLE jobs ADD FULLTEXT INDEX ft_jobs_search (title, company, description);
-- ALTER TABLE talents ADD FULLTEXT INDEX ft_talents_search (name, description);

-- ============================================
-- COMMENTS & DOCUMENTATION
-- ============================================

-- Table relationships:
-- users → jobs (one-to-many)
-- users → talents (one-to-many)
-- users → saved_jobs (one-to-many)
-- users → saved_talents (one-to-many)
-- users → job_applications (one-to-many)
-- jobs → job_applications (one-to-many)
-- jobs → saved_jobs (one-to-many)

-- Security Notes:
-- 1. Always hash passwords using bcrypt ($2b$10$...)
-- 2. Use prepared statements to prevent SQL injection
-- 3. Implement rate limiting on API endpoints
-- 4. Use JWT tokens with expiration for sessions
-- 5. Sanitize all user inputs
-- 6. Use HTTPS in production

-- Migration Notes:
-- 1. Update bcrypt hashes for sample passwords
-- 2. Configure database charset to utf8mb4
-- 3. Set appropriate max_connections
-- 4. Enable slow query log for optimization
-- 5. Regular backup strategy

-- ============================================
-- END OF SCHEMA
-- ============================================
