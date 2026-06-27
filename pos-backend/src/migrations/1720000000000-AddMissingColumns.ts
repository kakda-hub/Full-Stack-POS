import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds columns that are present in the TypeORM entities but missing from
 * the actual database schema on TiDB Cloud.
 *
 * The initial migration (InitialSchema1719240000000) was either not run
 * on TiDB Cloud or the tables were created with a different schema,
 * causing "Unknown column" errors at runtime.
 *
 * Missing columns identified from Render error logs:
 *   - `categories.img_url` — referenced by Category entity
 *   - `products.name_kh`   — referenced by Product entity
 *
 * We use MySQL's `IF NOT EXISTS`-compatible check via information_schema
 * so the migration is idempotent and safe to re-run.
 */
export class AddMissingColumns1720000000000 implements MigrationInterface {
  name = 'AddMissingColumns1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── categories.img_url ──────────────────────────────────────────────────
    const hasCategoryImgUrl = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'categories'
        AND \`COLUMN_NAME\` = 'img_url'
    `);
    if (hasCategoryImgUrl.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`categories\`
        ADD COLUMN \`img_url\` VARCHAR(500) NULL
        AFTER \`description\`
      `);
      console.log('[Migration] Added categories.img_url');
    } else {
      console.log('[Migration] categories.img_url already exists — skipping');
    }

    // ── products.name_kh ────────────────────────────────────────────────────
    const hasProductNameKh = await queryRunner.query(`
      SELECT 1 AS \`exists\`
      FROM \`information_schema\`.\`COLUMNS\`
      WHERE \`TABLE_SCHEMA\` = DATABASE()
        AND \`TABLE_NAME\` = 'products'
        AND \`COLUMN_NAME\` = 'name_kh'
    `);
    if (hasProductNameKh.length === 0) {
      await queryRunner.query(`
        ALTER TABLE \`products\`
        ADD COLUMN \`name_kh\` VARCHAR(150) NOT NULL DEFAULT ''
        AFTER \`name\`
      `);
      console.log('[Migration] Added products.name_kh');
    } else {
      console.log('[Migration] products.name_kh already exists — skipping');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`categories\` DROP COLUMN IF EXISTS \`img_url\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`products\` DROP COLUMN IF EXISTS \`name_kh\`
    `);
  }
}
