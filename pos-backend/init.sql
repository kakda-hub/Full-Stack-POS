-- ─── POS System Database Initialization ──────────────────────────────────────
-- This runs automatically on first Docker MySQL startup

CREATE DATABASE IF NOT EXISTS pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos_db;

-- Create tables before inserting seed data.
-- TypeORM synchronize will also create/update tables, but init.sql
-- runs before the backend connects, so we need the table to exist first.
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX IDX_EMAIL (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin user password: admin123
-- bcrypt hash generated at cost 10
INSERT IGNORE INTO users (name, email, password, role, is_active, created_at)
VALUES (
  'System Admin',
  'admin@pos.com',
  '$2b$10$5L4ckx/GV3u5HySLB/m5LecmdLpK4NIErNHGgyUf93EwPSsR4hm0q',
  'admin',
  1,
  NOW()
) ON DUPLICATE KEY UPDATE id=id;

-- Default cashier user password: cashier123
INSERT IGNORE INTO users (name, email, password, role, is_active, created_at)
VALUES (
  'Cashier User',
  'cashier@pos.com',
  '$2b$10$Se7U1YG42qaL13FSvjkTs.zZcrIY3kAzf4pxcvLC8SAw6wvfxspfa',
  'cashier',
  1,
  NOW()
) ON DUPLICATE KEY UPDATE id=id;

-- Categories table and seed data
CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  name_kh VARCHAR(100) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX IDX_CATEGORY_NAME (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO categories (id, name, name_kh, description) VALUES
  (1, 'Beverages', 'ភេសជ្ជៈ', 'Drinks and beverages'),
  (2, 'Food', 'អាហារ', 'Main dishes and meals'),
  (3, 'Snacks', 'អាហារសម្រន់', 'Light snacks'),
  (4, 'Dairy', 'ផលិតផលទឹកដោះ', 'Dairy products')
ON DUPLICATE KEY UPDATE id=id;

-- ─── Management Pages ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS management_pages (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  title_km VARCHAR(150) DEFAULT NULL,
  icon VARCHAR(50) DEFAULT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'page',
  url VARCHAR(255) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  permissions TEXT DEFAULT NULL,
  badge INT DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT NOT NULL DEFAULT 1,
  parent_id INT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT FK_management_pages_parent FOREIGN KEY (parent_id) REFERENCES management_pages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default navigation pages (top-level pages first)
INSERT IGNORE INTO management_pages (id, title, title_km, icon, type, url, sort_order) VALUES
  (1, 'POS Sale', 'លក់', 'sale', 'page', '/sales', 0),
  (2, 'Sales History', 'ប្រវត្តិលក់', 'history', 'page', '/sales-history', 1),
  (3, 'Product', 'ផលិតផល', 'product', 'page', '/products', 2),
  (4, 'Report', 'របាយការណ៍', 'report', 'page', '/reports', 3),
  (5, 'User', 'អ្នកប្រើ', 'user', 'page', '/users', 4),
  (6, 'Categories', 'ប្រភេទ', 'category', 'page', '/categories', 5),
  (7, 'Permission', 'ការអនុញ្ញាត', 'permission', 'page', '/permission', 6),
  (8, 'Setting', 'ការកំណត់', 'settings', 'menu', '/settings', 7)
ON DUPLICATE KEY UPDATE id=id;

-- Setting sub-menu items (children of parent_id = 8)
INSERT IGNORE INTO management_pages (id, title, title_km, icon, type, url, parent_id, sort_order) VALUES
  (9, 'page permission management', 'ការគ្រប់គ្រងការអនុញ្ញាតទំព័រ', 'permission', 'page', '/page-permission-management', 8, 0),
  (10, 'Management Page', 'គ្រប់គ្រង់ទំព័រ', 'management', 'page', '/management-page', 8, 1),
  (11, 'User Management', 'ការគ្រប់គ្រងអ្នកប្រើ', 'user', 'page', '/user-management', 8, 2),
  (12, 'User Role', 'តួនាទីអ្នកប្រើ', 'role', 'page', '/user-role', 8, 3),
  (13, 'Cloudinary File Upload', 'ការផ្ទុកឯកសារ Cloudinary', 'cloudinary', 'page', '/cloudinary-file-upload', 8, 4)
ON DUPLICATE KEY UPDATE id=id;
