import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pos_db',
  entities: [User, Category, Product, Sale, SaleItem],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: true,
  logging: true,
  
  charset: 'utf8mb4',
});
