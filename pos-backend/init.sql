-- ─── POS System Database Initialization ──────────────────────────────────────
-- This runs automatically on first Docker MySQL startup

CREATE DATABASE IF NOT EXISTS pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos_db;

-- Default admin user password: Admin@123
-- bcrypt hash generated at cost 10
INSERT IGNORE INTO users (name, email, password, role, is_active, created_at)
VALUES (
  'System Admin',
  'admin@pos.com',
  '$2b$10$g4eWNkxGf9lPtHQl1hM3duylo4UhzTtqaKXo0/cO9lz/QWfg/3HJq',
  'admin',
  1,
  NOW()
) ON DUPLICATE KEY UPDATE id=id;
