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

-- ========================================================================================= tests ===============================

-- -- ────────────── Create Database ──────────────
-- CREATE DATABASE IF NOT EXISTS pos_db;
-- USE pos_db;

-- -- ────────────── Users Table ──────────────
-- CREATE TABLE IF NOT EXISTS users (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   email VARCHAR(100) NOT NULL UNIQUE,
--   password VARCHAR(255) NOT NULL,
--   role ENUM('admin','cashier') DEFAULT 'cashier',
--   is_active TINYINT(1) DEFAULT 1,
--   created_at DATETIME DEFAULT NOW()
-- );

-- -- Default admin (password = "password")
-- INSERT INTO users (name, email, password, role, is_active, created_at)
-- VALUES ('Admin', 'admin@pos.com', '$2b$10$g4eWNkxGf9lPtHQl1hM3duylo4UhzTtqaKXo0/cO9lz/QWfg/3HJq', 'admin', 1, NOW());

-- -- Some cashiers
-- INSERT INTO users (name, email, password, role, is_active, created_at)
-- VALUES 
-- ('Jane Cashier', 'jane@pos.com', '$2b$10$g4eWNkxGf9lPtHQl1hM3duylo4UhzTtqaKXo0/cO9lz/QWfg/3HJq', 'cashier', 1, NOW()),
-- ('Bob Cashier', 'bob@pos.com', '$2b$10$g4eWNkxGf9lPtHQl1hM3duylo4UhzTtqaKXo0/cO9lz/QWfg/3HJq', 'cashier', 1, NOW());

-- -- ────────────── Categories Table ──────────────
-- CREATE TABLE IF NOT EXISTS categories (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL UNIQUE
-- );

-- INSERT INTO categories (name) VALUES
-- ('Beverages'),
-- ('Snacks'),
-- ('Bakery'),
-- ('Dairy');

-- -- ────────────── Products Table ──────────────
-- CREATE TABLE IF NOT EXISTS products (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(100) NOT NULL,
--   barcode VARCHAR(50) UNIQUE,
--   price DECIMAL(10,2) NOT NULL,
--   stock INT DEFAULT 0,
--   category_id INT,
--   is_active TINYINT(1) DEFAULT 1,
--   created_at DATETIME DEFAULT NOW(),
--   FOREIGN KEY (category_id) REFERENCES categories(id)
-- );

-- INSERT INTO products (name, barcode, price, stock, category_id)
-- VALUES
-- ('Iced Americano', '8851234567890', 3.50, 100, 1),
-- ('Cappuccino', '8851234567891', 4.00, 50, 1),
-- ('Chocolate Muffin', '8851234567892', 2.50, 30, 3),
-- ('Cheese Sandwich', '8851234567893', 3.00, 20, 2),
-- ('Milk 1L', '8851234567894', 1.50, 40, 4);

-- -- ────────────── Sales Table ──────────────
-- CREATE TABLE IF NOT EXISTS sales (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   user_id INT,
--   subtotal DECIMAL(10,2),
--   discount DECIMAL(10,2) DEFAULT 0,
--   tax DECIMAL(10,2) DEFAULT 0,
--   total DECIMAL(10,2),
--   payment_method ENUM('cash','aba','card') DEFAULT 'cash',
--   created_at DATETIME DEFAULT NOW(),
--   FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- -- ────────────── Sale Items Table ──────────────
-- CREATE TABLE IF NOT EXISTS sale_items (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   sale_id INT,
--   product_id INT,
--   quantity INT,
--   price DECIMAL(10,2),
--   FOREIGN KEY (sale_id) REFERENCES sales(id),
--   FOREIGN KEY (product_id) REFERENCES products(id)
-- );

-- -- Example sale 1
-- INSERT INTO sales (user_id, subtotal, discount, tax, total, payment_method)
-- VALUES (2, 10.50, 1.00, 0.50, 10.00, 'cash');

-- INSERT INTO sale_items (sale_id, product_id, quantity, price)
-- VALUES
-- (1, 1, 2, 3.50),
-- (1, 3, 1, 3.50);

-- -- Example sale 2
-- INSERT INTO sales (user_id, subtotal, discount, tax, total, payment_method)
-- VALUES (3, 7.50, 0.50, 0.25, 7.25, 'card');

-- INSERT INTO sale_items (sale_id, product_id, quantity, price)
-- VALUES
-- (2, 2, 1, 4.00),
-- (2, 5, 1, 1.50),
-- (2, 4, 1, 3.00);

-- -- ────────────── Reports (view) ──────────────
-- CREATE OR REPLACE VIEW report_summary AS
-- SELECT 
--   COUNT(s.id) AS total_sales,
--   SUM(s.total) AS total_revenue,
--   SUM(s.discount) AS total_discount,
--   AVG(s.total) AS average_order_value
-- FROM sales s;