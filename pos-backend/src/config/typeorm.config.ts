import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Sale } from '../modules/sales/entities/sale.entity';
import { SaleItem } from '../modules/sales/entities/sale-item.entity';
import { FileUpload } from '../modules/upload/entities/upload.entity';
import { ManagementPage } from '../modules/management/entities/management-page.entity';
import * as dotenv from 'dotenv';
import { buildEnvDbOptions } from './db-options';

dotenv.config();

/**
 * TypeORM CLI DataSource for running migrations.
 * Uses environment variables (or .env file) — never hardcoded values.
 * The same DB_* variables that drive the runtime app also drive this CLI,
 * via the shared `buildEnvDbOptions()` helper (validates & applies SSL rule).
 *
 * Run: npm run migration:generate -- src/migrations/InitialSchema
 * Run: npm run migration:run
 * Run: npm run migration:revert
 */
export default new DataSource({
  ...buildEnvDbOptions(),

  entities: [User, Category, Product, Sale, SaleItem, FileUpload, ManagementPage],
  migrations: ['src/database/migrations/**/*.ts'],
  synchronize: false,
  logging: true,

  extra: {
    connectionLimit: 5,
    charset: 'utf8mb4',
  },
});
