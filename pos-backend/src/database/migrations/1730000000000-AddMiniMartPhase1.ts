import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add Mini Mart Phase 1 features
 *   - low_stock_threshold & expiry_date on products
 *   - quick_picks table
 */
export class AddMiniMartPhase11730000000000 implements MigrationInterface {
  name = 'AddMiniMartPhase11730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── products.low_stock_threshold ─────────────────────────────────────
    const hasLowStock = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'products'
        AND \`COLUMN_NAME\` = 'low_stock_threshold'
    `);
    if (hasLowStock.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`products\`
        ADD COLUMN \`low_stock_threshold\` INT NOT NULL DEFAULT 10
        AFTER \`cost_price\`
      `);
    }

    // ── products.expiry_date ─────────────────────────────────────────────
    const hasExpiry = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'products'
        AND \`COLUMN_NAME\` = 'expiry_date'
    `);
    if (hasExpiry.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`products\`
        ADD COLUMN \`expiry_date\` DATE NULL
        AFTER \`low_stock_threshold\`
      `);
    }

    // ── quick_picks table ──────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`quick_picks\` (
        \`id\`         INT              NOT NULL AUTO_INCREMENT,
        \`label\`      VARCHAR(100)     NOT NULL,
        \`label_kh\`   VARCHAR(100)     NULL,
        \`price\`      DECIMAL(10,2)    NOT NULL,
        \`icon\`       VARCHAR(50)      NULL,
        \`sort_order\` INT              NOT NULL DEFAULT 1,
        \`is_active\`  TINYINT          NOT NULL DEFAULT 1,
        \`created_at\` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Seed some default quick picks
    await queryRunner.query(`
      INSERT INTO \`quick_picks\` (\`label\`, \`label_kh\`, \`price\`, \`icon\`, \`sort_order\`) VALUES
        ('Plastic Bag', 'ថង់ប្លាស្ទិក', 0.25, '🛍️', 1),
        ('Ice', 'ទឹកកក', 0.50, '🧊', 2),
        ('Straw', 'ចំបើង', 0.10, '🥤', 3),
        ('Tissue', 'ក្រដាស់ជូត', 0.30, '🧻', 4)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove products columns
    const hasLowStock = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'products'
        AND \`COLUMN_NAME\` = 'low_stock_threshold'
    `);
    if (hasLowStock.length > 0) {
      await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`low_stock_threshold\``);
    }

    const hasExpiry = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'products'
        AND \`COLUMN_NAME\` = 'expiry_date'
    `);
    if (hasExpiry.length > 0) {
      await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`expiry_date\``);
    }

    await queryRunner.query(`DROP TABLE IF EXISTS \`quick_picks\``);
  }
}
