import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { FileUpload } from '../upload/entities/upload.entity';
import { ManagementPage } from '../management/entities/management-page.entity';
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
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT, 10) || 4000,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos_db',
  entities: [User, Category, Product, Sale, SaleItem, FileUpload, ManagementPage],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
  charset: 'utf8mb4',
  ssl: {
    rejectUnauthorized: true,
  },
  extra: {
    connectionLimit: 5,
  },
});
