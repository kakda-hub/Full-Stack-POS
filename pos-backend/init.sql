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
