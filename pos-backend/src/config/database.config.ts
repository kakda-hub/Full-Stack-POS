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

/**
 * Logs a diagnostic summary of all DB-related environment variables.
 * Key names are shown (values are MASKED) so you can verify which vars
 * are reaching the runtime without leaking secrets.
 */
function logDbEnvDiagnostics(configService: ConfigService): void {
  const dbKeys = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_SSL',
    'DATABASE_URL',
    'DATABASE_PASSWORD',
    'MYSQL_PASSWORD',
    'MYSQL_ROOT_PASSWORD',
    'TIDB_PASSWORD',
    'TIDB_USER',
    'TIDB_HOST',
  ];
  const lines: string[] = ['[DB] Environment variable diagnostic:'];
  for (const key of dbKeys) {
    const raw = configService.get<string>(key);
    if (raw !== undefined && raw !== null) {
      // Mask the value so secrets aren't leaked, but show length as a hint
      const masked = raw.length > 0 ? `**** (${raw.length} chars)` : '(empty string)';
      lines.push(`  ✅ ${key} = ${masked}`);
    } else {
      lines.push(`  ❌ ${key} = NOT SET`);
    }
  }
  console.log(lines.join('\n'));
}

/**
 * Resolves the database password from multiple possible env var names.
 * This provides flexibility across different deployment environments
 * (Render, Railway, local .env, etc.) that may use different key names.
 */
function resolveDbPassword(configService: ConfigService): string | undefined {
  const candidates = [
    'DB_PASSWORD',
    'DB_PASS',             // fallback (alternative naming convention)
    'DATABASE_PASSWORD',
    'MYSQL_PASSWORD',
    'MYSQL_ROOT_PASSWORD',
    'TIDB_PASSWORD',
  ];
  for (const key of candidates) {
    const value = configService.get<string>(key);
    if (value && value.length > 0) return value;
  }
  // Last resort: try legacy MYSQL_PWD (less common)
  const legacy = configService.get<string>('MYSQL_PWD');
  if (legacy && legacy.length > 0) return legacy;

  console.error(
    '[DB] ❌ FATAL: No database password found via any env var (tried: %s).\n' +
    '[DB]    Set one of these in your Render dashboard → Environment Variables.',
    candidates.join(', '),
  );
  return undefined;
}

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // ── Diagnostics: log which env vars are present (values masked) ────────
  logDbEnvDiagnostics(configService);

  // ── Resolve password (with logging) ────────────────────────────────────
  const password = resolveDbPassword(configService);
  const host = configService.get<string>('DB_HOST');
  const user = configService.get<string>('DB_USER');
  const database = configService.get<string>('DB_NAME');

  console.log(
    '[DB] Connecting with → host=%s  user=%s  database=%s  port=%d  password=%s',
    host,
    user,
    database,
    configService.get<number>('DB_PORT', 4000),
    password ? '✓ set' : '✗ MISSING',
  );

  return {
    type: 'mysql',
    autoLoadEntities: true,

    host,
    port: configService.get<number>('DB_PORT', 4000),
    username: user,
    password,
    database,

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
  };
};