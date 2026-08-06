import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Priority 1 Mini Mart features migration:
 *   - cost_price on products
 *   - suppliers
 *   - purchase_orders / purchase_order_items
 *   - returns / return_items
 *
 * Reverts by dropping new tables and removing cost_price column,
 * in reverse dependency order.
 */
export class AddMiniMartFeatures1721000000000 implements MigrationInterface {
  name = 'AddMiniMartFeatures1721000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── products.cost_price ──────────────────────────────────────────────────
    const hasCostPrice = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'products'
        AND \`COLUMN_NAME\` = 'cost_price'
    `);
    if (hasCostPrice.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`products\`
        ADD COLUMN \`cost_price\` DECIMAL(10,2) NULL
        AFTER \`price\`
      `);
    }

    // ── suppliers ────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`suppliers\` (
        \`id\`              INT              NOT NULL AUTO_INCREMENT,
        \`name\`            VARCHAR(150)     NOT NULL,
        \`contact_person\`  VARCHAR(150)     NULL,
        \`phone\`           VARCHAR(20)      NULL,
        \`email\`           VARCHAR(150)     NULL,
        \`address\`         TEXT             NULL,
        \`tax_id\`          VARCHAR(50)      NULL,
        \`is_active\`       TINYINT          NOT NULL DEFAULT 1,
        \`notes\`           TEXT             NULL,
        \`created_at\`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── purchase_orders ──────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`purchase_orders\` (
        \`id\`              INT              NOT NULL AUTO_INCREMENT,
        \`order_number\`    VARCHAR(50)      NOT NULL,
        \`supplier_id\`     INT              NOT NULL,
        \`status\`          ENUM('draft','ordered','partially_received','received','cancelled') NOT NULL DEFAULT 'draft',
        \`subtotal\`        DECIMAL(10,2)    NOT NULL DEFAULT 0,
        \`discount\`        DECIMAL(10,2)    NOT NULL DEFAULT 0,
        \`shipping_cost\`   DECIMAL(10,2)    NOT NULL DEFAULT 0,
        \`total\`           DECIMAL(10,2)    NOT NULL DEFAULT 0,
        \`notes\`           TEXT             NULL,
        \`ordered_by\`      INT              NOT NULL,
        \`received_by\`     INT              NULL,
        \`received_at\`     DATETIME         NULL,
        \`created_at\`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\`      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_purchase_orders_number\` (\`order_number\`),
        INDEX \`IDX_purchase_orders_supplier\` (\`supplier_id\`),
        CONSTRAINT \`FK_purchase_orders_supplier\`
          FOREIGN KEY (\`supplier_id\`)
          REFERENCES \`suppliers\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE,
        CONSTRAINT \`FK_purchase_orders_user\`
          FOREIGN KEY (\`ordered_by\`)
          REFERENCES \`users\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── purchase_order_items ─────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`purchase_order_items\` (
        \`id\`                  INT          NOT NULL AUTO_INCREMENT,
        \`purchase_order_id\`   INT          NOT NULL,
        \`product_id\`          INT          NOT NULL,
        \`quantity\`            INT          NOT NULL,
        \`received_quantity\`   INT          NOT NULL DEFAULT 0,
        \`unit_cost\`           DECIMAL(10,2) NOT NULL,
        \`total\`               DECIMAL(10,2) NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_po_items_order\` (\`purchase_order_id\`),
        INDEX \`IDX_po_items_product\` (\`product_id\`),
        CONSTRAINT \`FK_po_items_order\`
          FOREIGN KEY (\`purchase_order_id\`)
          REFERENCES \`purchase_orders\`(\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`FK_po_items_product\`
          FOREIGN KEY (\`product_id\`)
          REFERENCES \`products\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── returns ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`returns\` (
        \`id\`             INT              NOT NULL AUTO_INCREMENT,
        \`sale_id\`        INT              NOT NULL,
        \`total\`          DECIMAL(10,2)    NOT NULL DEFAULT 0,
        \`status\`         ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        \`reason\`         TEXT             NULL,
        \`processed_by\`   INT              NOT NULL,
        \`created_at\`     DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_returns_sale\` (\`sale_id\`),
        CONSTRAINT \`FK_returns_sale\`
          FOREIGN KEY (\`sale_id\`)
          REFERENCES \`sales\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE,
        CONSTRAINT \`FK_returns_user\`
          FOREIGN KEY (\`processed_by\`)
          REFERENCES \`users\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── return_items ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`return_items\` (
        \`id\`            INT              NOT NULL AUTO_INCREMENT,
        \`return_id\`     INT              NOT NULL,
        \`product_id\`    INT              NOT NULL,
        \`quantity\`      INT              NOT NULL,
        \`price\`         DECIMAL(10,2)    NOT NULL,
        \`refund_amount\` DECIMAL(10,2)    NOT NULL DEFAULT 0,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_return_items_return\` (\`return_id\`),
        INDEX \`IDX_return_items_product\` (\`product_id\`),
        CONSTRAINT \`FK_return_items_return\`
          FOREIGN KEY (\`return_id\`)
          REFERENCES \`returns\`(\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`FK_return_items_product\`
          FOREIGN KEY (\`product_id\`)
          REFERENCES \`products\`(\`id\`)
          ON DELETE RESTRICT
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`return_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`returns\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`purchase_order_items\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`purchase_orders\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`suppliers\``);

    // Remove cost_price column (safe check via information_schema)
    const hasCostPrice = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'products'
        AND \`COLUMN_NAME\` = 'cost_price'
    `);
    if (hasCostPrice.length > 0) {
      await queryRunner.query(`
        ALTER TABLE \`products\` DROP COLUMN \`cost_price\`
      `);
    }
  }
}
