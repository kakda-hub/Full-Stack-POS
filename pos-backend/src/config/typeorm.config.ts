import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Sale } from '../modules/sales/entities/sale.entity';
import { SaleItem } from '../modules/sales/entities/sale-item.entity';
import { FileUpload } from '../modules/upload/entities/upload.entity';
import { ManagementPage } from '../modules/management/entities/management-page.entity';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * TypeORM CLI DataSource for running migrations.
 * Uses environment variables (or .env file) consistent with TiDB Cloud.
 *
 * Run: npm run migration:generate -- src/migrations/InitialSchema
 * Run: npm run migration:run
 * Run: npm run migration:revert
 */

/**
 * Resolves the database password from multiple possible env var names.
 */
function resolveDbPassword(): string {
  const candidates = ['DB_PASSWORD', 'DATABASE_PASSWORD', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD'];
  for (const key of candidates) {
    const value = process.env[key];
    if (value) return value;
  }
  console.warn('[DB] No database password found via any env var (tried: %s)', candidates.join(', '));
  return '';
}

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT, 10) || 4000,
  username: process.env.DB_USER || 'root',
  password: resolveDbPassword(),
  database: process.env.DB_NAME || 'pos_db',
  entities: [User, Category, Product, Sale, SaleItem, FileUpload, ManagementPage],
  migrations: ['src/database/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
  charset: 'utf8mb4',
  ssl: process.env.DB_SSL === 'false'
    ? false
    : {
        rejectUnauthorized: false,
      },
  extra: {
    connectionLimit: 5,
    charset: 'utf8mb4',
  },
});
