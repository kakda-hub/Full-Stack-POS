import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Product } from '../products/entities/product.entity';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { FileUpload } from '../upload/entities/upload.entity';

/**
 * Factory function for TypeORM configuration via ConfigService.
 *
 * TiDB Cloud requires:
 *  - MySQL protocol (type: 'mysql')
 *  - Port 4000 (TiDB Cloud Serverless default)
 *  - Strict SSL: ssl: { rejectUnauthorized: true }
 *
 * Connection pooling is configured via the `extra.connectionLimit` option.
 * Auto-retry ensures the app waits for the database to become available.
 */
export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  autoLoadEntities: true,

  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT', 4000),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),

  entities: [User, Category, Product, Sale, SaleItem, FileUpload],

  // Migrations are the source of truth — synchronize is disabled to prevent
  // accidental schema drift. Run `npm run migration:run` to apply changes.
  synchronize: false,
  migrations: ['dist/migrations/**/*.js'],
  migrationsRun: true,
  logging: configService.get<string>('NODE_ENV') === 'development',

  charset: 'utf8mb4',
  timezone: '+00:00',

  /**
   * SSL/TLS configuration.
   *
   * - TiDB Cloud (production): requires SSL with `rejectUnauthorized: true`.
   *   Set DB_SSL=true (default) to enable.
   * - Local MySQL (dev/testing): typically no SSL needed.
   *   Set DB_SSL=false to disable.
   */
  ssl: configService.get<string>('DB_SSL', 'true') === 'true'
    ? { rejectUnauthorized: true }
    : false,

  extra: {
    connectionLimit: 10,
  },

  // Retry connection up to 10 times with 3s delay
  retryAttempts: 10,
  retryDelay: 3000,
});
