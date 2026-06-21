// import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { User } from '../users/entities/user.entity';
// import { Category } from '../categories/entities/category.entity';
// import { Product } from '../products/entities/product.entity';
// import { Sale } from '../sales/entities/sale.entity';
// import { SaleItem } from '../sales/entities/sale-item.entity';

// export const databaseConfig = (): TypeOrmModuleOptions => ({
//   type: 'mysql',
//   host: process.env.DB_HOST || 'mysql',
//   port: parseInt(process.env.DB_PORT, 10) || 3306,
//   username: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '',
//   database: process.env.DB_NAME || 'pos_db',
//   entities: [User, Category, Product, Sale, SaleItem],
//   synchronize: process.env.NODE_ENV !== 'production',
//   migrations: ['dist/migrations/**/*.js'],
//   migrationsRun: process.env.NODE_ENV === 'production',
//   logging: process.env.NODE_ENV === 'development',
//   charset: 'utf8mb4',
//   timezone: '+00:00',
//   extra: {
//     connectionLimit: 10,
//   },
//   // Retry config
//   retryAttempts: 10,
//   retryDelay: 3000, // 3 seconds
// });

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { FileUpload } from '../upload/entities/upload.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  autoLoadEntities: true,

  host: process.env.DB_HOST || 'localhost',

  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USER || 'root',

  password: process.env.DB_PASSWORD || 'rootpassword',

  database: process.env.DB_NAME || 'pos_db',

  entities: [User, Category, Product, Sale, SaleItem, FileUpload],

  // synchronize: process.env.NODE_ENV !== 'production',
  synchronize: true,
  migrations: ['dist/migrations/**/*.js'],
  migrationsRun: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV === 'development',

  charset: 'utf8mb4',
  timezone: '+00:00',

  extra: {
    connectionLimit: 10,
  },

  retryAttempts: 10,
  retryDelay: 3000,
});