import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial baseline migration for the POS system.
 *
 * Captures all entities as CREATE TABLE statements so the schema
 * can be reproduced on a fresh database without relying on
 * TypeORM's synchronize feature.
 *
 * Reverts by dropping all tables in reverse dependency order.
 */
export class InitialSchema1719240000000 implements MigrationInterface {
  name = 'InitialSchema1719240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── users ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\`          INT             NOT NULL AUTO_INCREMENT,
        \`name\`        VARCHAR(100)    NOT NULL,
        \`email\`       VARCHAR(150)    NOT NULL,
        \`password\`    VARCHAR(255)    NOT NULL,
        \`role\`        ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
        \`is_active\`   TINYINT         NOT NULL DEFAULT 1,
        \`avatar_url\`  VARCHAR(500)    NULL,
        \`reset_token\` VARCHAR(255)    NULL,
        \`reset_token_expiry\` TIMESTAMP NULL,
        \`created_at\`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ─── categories ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\`          INT             NOT NULL AUTO_INCREMENT,
        \`name\`        VARCHAR(100)    NOT NULL,
        \`name_kh\`     VARCHAR(100)    NULL,
        \`description\` VARCHAR(255)    NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_categories_name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ─── products ─────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\`          INT              NOT NULL AUTO_INCREMENT,
        \`name\`        VARCHAR(150)     NOT NULL,
        \`name_kh\`     VARCHAR(150)     NOT NULL,
        \`img_url\`     VARCHAR(255)     NULL,
        \`barcode\`     VARCHAR(100)     NOT NULL,
        \`price\`       DECIMAL(10,2)    NOT NULL,
        \`stock\`       INT              NOT NULL DEFAULT 0,
        \`category_id\` INT              NOT NULL,
        \`description\` TEXT             NULL,
        \`is_active\`   TINYINT          NOT NULL DEFAULT 1,
        \`created_at\`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_products_barcode\` (\`barcode\`),
        INDEX \`IDX_products_category_id\` (\`category_id\`),
        CONSTRAINT \`FK_products_category\`
          FOREIGN KEY (\`category_id\`)
          REFERENCES \`categories\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ─── sales ────────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sales\` (
        \`id\`             INT               NOT NULL AUTO_INCREMENT,
        \`user_id\`        INT               NOT NULL,
        \`subtotal\`       DECIMAL(10,2)     NOT NULL DEFAULT 0,
        \`discount\`       DECIMAL(10,2)     NOT NULL DEFAULT 0,
        \`tax\`            DECIMAL(10,2)     NOT NULL DEFAULT 0,
        \`total\`          DECIMAL(10,2)     NOT NULL,
        \`payment_method\` ENUM('cash', 'aba', 'card') NOT NULL DEFAULT 'cash',
        \`created_at\`     DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_sales_user_id\` (\`user_id\`),
        CONSTRAINT \`FK_sales_user\`
          FOREIGN KEY (\`user_id\`)
          REFERENCES \`users\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ─── sale_items ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`sale_items\` (
        \`id\`         INT              NOT NULL AUTO_INCREMENT,
        \`sale_id\`    INT              NOT NULL,
        \`product_id\` INT              NOT NULL,
        \`quantity\`   INT              NOT NULL,
        \`price\`      DECIMAL(10,2)    NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_sale_items_sale_id\` (\`sale_id\`),
        INDEX \`IDX_sale_items_product_id\` (\`product_id\`),
        CONSTRAINT \`FK_sale_items_sale\`
          FOREIGN KEY (\`sale_id\`)
          REFERENCES \`sales\`(\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`FK_sale_items_product\`
          FOREIGN KEY (\`product_id\`)
          REFERENCES \`products\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ─── file_uploads ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`file_uploads\` (
        \`id\`                  INT            NOT NULL AUTO_INCREMENT,
        \`original_file_name\`  VARCHAR(255)   NOT NULL,
        \`file_name\`           VARCHAR(255)   NOT NULL,
        \`file_path\`           VARCHAR(255)   NOT NULL,
        \`file_url\`            VARCHAR(255)   NOT NULL,
        \`file_extension\`      VARCHAR(255)   NOT NULL,
        \`file_size\`           BIGINT         NOT NULL,
        \`upload_by\`           VARCHAR(255)   NULL,
        \`upload_type\`         VARCHAR(255)   NOT NULL DEFAULT 'file-upload-type-general',
        \`destination_storage\` VARCHAR(255)   NOT NULL DEFAULT 'MINIO',
        \`width\`               INT            NULL,
        \`height\`              INT            NULL,
        \`description\`         TEXT           NULL,
        \`is_deleted\`          TINYINT        NOT NULL DEFAULT 0,
        \`group_id\`            VARCHAR(255)   NULL,
        \`public_id\`           VARCHAR(255)   NULL,
        \`upload_date\`         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ─── management_pages ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`management_pages\` (
        \`id\`          INT            NOT NULL AUTO_INCREMENT,
        \`title\`       VARCHAR(150)   NOT NULL,
        \`title_km\`    VARCHAR(150)   NULL,
        \`icon\`        VARCHAR(50)    NULL,
        \`type\`        VARCHAR(20)    NOT NULL DEFAULT 'page',
        \`url\`         VARCHAR(255)   NULL,
        \`description\` VARCHAR(255)   NULL,
        \`permissions\` TEXT           NULL,
        \`badge\`       INT            NULL,
        \`sort_order\`  INT            NOT NULL DEFAULT 0,
        \`is_active\`   TINYINT        NOT NULL DEFAULT 1,
        \`parent_id\`   INT            NULL,
        \`created_at\`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_management_pages_parent\`
          FOREIGN KEY (\`parent_id\`)
          REFERENCES \`management_pages\`(\`id\`)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ─── Seed data ────────────────────────────────────────────────────────────
    // Default users  (password: admin123 / cashier123)
    await queryRunner.query(`
      INSERT IGNORE INTO \`users\` (\`name\`, \`email\`, \`password\`, \`role\`, \`is_active\`, \`created_at\`)
      VALUES
        ('System Admin', 'admin@pos.com', '$2a$10$icRoPSw9bvBWU23LcQs5I./uh0.a8ZDN.jgnlvl.I7Jzfepta/wUe', 'admin', 1, NOW())
    `);
    await queryRunner.query(`
      INSERT IGNORE INTO \`users\` (\`name\`, \`email\`, \`password\`, \`role\`, \`is_active\`, \`created_at\`)
      VALUES
        ('Cashier User', 'cashier@pos.com', '$2a$10$/ir59IWBkazIrGO59Icfxuk1j98CC83vCJlx855Mdp/v3a3CChkla', 'cashier', 1, NOW())
    `);

    // Default categories
    await queryRunner.query(`
      INSERT IGNORE INTO \`categories\` (\`id\`, \`name\`, \`name_kh\`, \`description\`)
      VALUES
        (1, 'Beverages', 'ភេសជ្ជៈ', 'Drinks and beverages'),
        (2, 'Food', 'អាហារ', 'Main dishes and meals'),
        (3, 'Snacks', 'អាហារសម្រន់', 'Light snacks'),
        (4, 'Dairy', 'ផលិតផលទឹកដោះ', 'Dairy products')
    `);

    // Default management pages (top-level first)
    await queryRunner.query(`
      INSERT IGNORE INTO \`management_pages\` (\`id\`, \`title\`, \`title_km\`, \`icon\`, \`type\`, \`url\`, \`sort_order\`)
      VALUES
        (1, 'POS Sale', 'លក់', 'sale', 'page', '/sales', 0),
        (2, 'Sales History', 'ប្រវត្តិលក់', 'history', 'page', '/sales-history', 1),
        (3, 'Product', 'ផលិតផល', 'product', 'page', '/products', 2),
        (4, 'Report', 'របាយការណ៍', 'report', 'page', '/reports', 3),
        (5, 'User', 'អ្នកប្រើ', 'user', 'page', '/users', 4),
        (6, 'Categories', 'ប្រភេទ', 'category', 'page', '/categories', 5),
        (7, 'Permission', 'ការអនុញ្ញាត', 'permission', 'page', '/permission', 6),
        (8, 'Setting', 'ការកំណត់', 'settings', 'menu', '/settings', 7)
    `);
    // Setting sub-menu items (children of parent_id = 8)
    await queryRunner.query(`
      INSERT IGNORE INTO \`management_pages\` (\`id\`, \`title\`, \`title_km\`, \`icon\`, \`type\`, \`url\`, \`parent_id\`, \`sort_order\`)
      VALUES
        (9, 'page permission management', 'ការគ្រប់គ្រងការអនុញ្ញាតទំព័រ', 'permission', 'page', '/page-permission-management', 8, 0),
        (10, 'Management Page', 'គ្រប់គ្រង់ទំព័រ', 'management', 'page', '/management-page', 8, 1),
        (11, 'User Management', 'ការគ្រប់គ្រងអ្នកប្រើ', 'user', 'page', '/user-management', 8, 2),
        (12, 'User Role', 'តួនាទីអ្នកប្រើ', 'role', 'page', '/user-role', 8, 3),
        (13, 'Cloudinary File Upload', 'ការផ្ទុកឯកសារ Cloudinary', 'cloudinary', 'page', '/cloudinary-file-upload', 8, 4)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order (child tables first)
    await queryRunner.query(`DROP TABLE IF EXISTS \`sale_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`sales\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`products\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`categories\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`file_uploads\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`management_pages\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
