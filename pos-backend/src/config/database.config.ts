import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Sale } from '../modules/sales/entities/sale.entity';
import { SaleItem } from '../modules/sales/entities/sale-item.entity';
import { FileUpload } from '../modules/upload/entities/upload.entity';
import { buildDbOptions, isDbSslEnabled, resolveDbPassword } from './db-options';

/**
 * Runtime TypeORM configuration, fully driven by environment variables.
 *
 * No database value is hardcoded — the environment decides which database
 * is used:
 *   - Local development (master): DB_HOST=mysql / DB_PORT=3306 / DB_SSL=false
 *   - Production (main, Render + TiDB Cloud): DB_HOST=<tidb host> / DB_PORT=4000 / DB_SSL=true
 *
 * Missing required variables cause startup to fail with a clear message
 * (see env.validation.ts).
 */


export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const host = configService.get<string>('DB_HOST');
  const port = Number(configService.get<string>('DB_PORT', '3306'));
  // Accept both naming conventions (DB_USER / DB_USERNAME, DB_NAME / DB_DATABASE)
  // for compatibility across hosts.
  const username =
    configService.get<string>('DB_USER') || configService.get<string>('DB_USERNAME');
  const password = resolveDbPassword((key) => configService.get<string>(key));
  const database =
    configService.get<string>('DB_NAME') || configService.get<string>('DB_DATABASE');
  const sslEnabled = isDbSslEnabled(configService.get<string>('DB_SSL', 'false'));

  return {
    ...buildDbOptions({ host, port, username, password, database, ssl: sslEnabled }),

    autoLoadEntities: true,
    entities: [User, Category, Product, Sale, SaleItem, FileUpload],

    // Migrations are the source of truth — synchronize is disabled to prevent
    // accidental schema drift. Run `npm run migration:run` to apply changes.
    synchronize: false,
    migrations: ['dist/src/database/migrations/**/*.js'],
    migrationsRun: true,
    logging: configService.get<string>('NODE_ENV') === 'development',

    // Retry connection for up to ~90 seconds (30 attempts × 3s delay)
    // Handles MySQL container restarts and startup ordering.
    retryAttempts: 30,
    retryDelay: 3000,
  };
};