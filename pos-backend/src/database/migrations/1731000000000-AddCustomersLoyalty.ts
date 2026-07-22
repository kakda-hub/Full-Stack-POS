import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add Customer Profiles & Loyalty Points (Phase 2)
 *   - customers table
 *   - customer_id, points_earned, points_redeemed, loyalty_discount on sales
 */
export class AddCustomersLoyalty1731000000000 implements MigrationInterface {
  name = 'AddCustomersLoyalty1731000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── customers table ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`customers\` (
        \`id\`                INT              NOT NULL AUTO_INCREMENT,
        \`name\`              VARCHAR(100)     NOT NULL,
        \`phone\`             VARCHAR(20)      NOT NULL,
        \`email\`             VARCHAR(150)     NULL,
        \`address\`           TEXT             NULL,
        \`total_spent\`       DECIMAL(12,2)    NOT NULL DEFAULT 0,
        \`total_purchases\`   INT              NOT NULL DEFAULT 0,
        \`loyalty_points\`    INT              NOT NULL DEFAULT 0,
        \`points_per_dollar\` INT              NOT NULL DEFAULT 10,
        \`is_active\`         TINYINT          NOT NULL DEFAULT 1,
        \`created_at\`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_customers_phone\` (\`phone\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── sales.customer_id ──────────────────────────────────────────────
    const hasCustomerId = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'sales'
        AND \`COLUMN_NAME\` = 'customer_id'
    `);
    if (hasCustomerId.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`sales\`
        ADD COLUMN \`customer_id\` INT NULL AFTER \`payment_method\`,
        ADD COLUMN \`points_earned\` INT NOT NULL DEFAULT 0 AFTER \`customer_id\`,
        ADD COLUMN \`points_redeemed\` INT NOT NULL DEFAULT 0 AFTER \`points_earned\`,
        ADD COLUMN \`loyalty_discount\` DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER \`points_redeemed\`
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove sales columns
    const hasCustomerId = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'sales'
        AND \`COLUMN_NAME\` = 'customer_id'
    `);
    if (hasCustomerId.length > 0) {
      await queryRunner.query(`
        ALTER TABLE \`sales\`
        DROP COLUMN \`loyalty_discount\`,
        DROP COLUMN \`points_redeemed\`,
        DROP COLUMN \`points_earned\`,
        DROP COLUMN \`customer_id\`
      `);
    }

    await queryRunner.query(`DROP TABLE IF EXISTS \`customers\``);
  }
}
