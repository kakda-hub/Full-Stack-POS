import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * TypeORM options with a concrete MySQL driver. `TypeOrmModuleOptions`
 * alone leaves `type` optional, which breaks spreading into
 * `new DataSource(...)`. This keeps the `'mysql'` discriminator literal.
 */
export type MysqlDbOptions = TypeOrmModuleOptions & { type: 'mysql' };

/**
 * Shared, environment-driven TypeORM options.
 *
 * The application NEVER hardcodes database values. Everything comes from
 * environment variables:
 *   - Runtime (NestJS): read through ConfigService (see database.config.ts)
 *   - TypeORM CLI & seeders: read directly from process.env
 *
 * Supported variables:
 *   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL
 */

export interface DbEnvValues {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

/**
 * Returns true when DB_SSL is set to "true" (trimmed).
 * Used everywhere (runtime config, CLI, seeders) so the SSL decision is
 * consistent regardless of whitespace in the environment value.
 */
export function isDbSslEnabled(value: string | undefined): boolean {
  return String(value ?? '').trim() === 'true';
}

/**
 * Resolves the database password from the canonical env var, with a few
 * legacy aliases kept for compatibility across hosts (Render, Railway, etc.).
 */
export function resolveDbPassword(
  get: (key: string) => string | undefined,
): string | undefined {
  const candidates = [
    'DB_PASSWORD',
    'DB_PASS',
    'DATABASE_PASSWORD',
    'MYSQL_PASSWORD',
    'MYSQL_ROOT_PASSWORD',
    'TIDB_PASSWORD',
    'MYSQL_PWD',
  ];
  for (const key of candidates) {
    const value = get(key);
    if (value && value.length > 0) return value;
  }
  return undefined;
}

/**
 * Builds the base TypeORM options object from env values.
 *
 * SSL is only enabled when DB_SSL === 'true' (TiDB Cloud production),
 * and disabled otherwise (local MySQL development):
 *   ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false
 */
export function buildDbOptions(env: DbEnvValues): MysqlDbOptions {
  return {
    type: 'mysql',
    host: env.host,
    port: env.port,
    username: env.username,
    password: env.password,
    database: env.database,
    charset: 'utf8mb4',
    timezone: '+00:00',
    ssl: env.ssl === true ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : false,
    extra: {
      connectionLimit: 10,
      charset: 'utf8mb4',
    },
  };
}

/**
 * Reads database configuration directly from `process.env` and validates the
 * required variables. Used by the TypeORM CLI and seed scripts so they always
 * stay in sync with the runtime configuration.
 */
export function buildEnvDbOptions(): MysqlDbOptions {
  const host = process.env.DB_HOST;
  const port = parseInt(process.env.DB_PORT, 10);
  // Accept both naming conventions (DB_USER and DB_USERNAME are equivalent,
  // as are DB_NAME and DB_DATABASE) for compatibility across hosts.
  const username = process.env.DB_USER || process.env.DB_USERNAME;
  const password = resolveDbPassword((key) => process.env[key]);
  const database = process.env.DB_NAME || process.env.DB_DATABASE;
  const sslEnabled = isDbSslEnabled(process.env.DB_SSL);

  if (!host || !port || !username || !password || !database) {
    throw new Error(
      '[Config] ❌ Missing required database environment variables ' +
        '(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME). ' +
        'Copy pos-backend/.env.example to pos-backend/.env and fill in the values.',
    );
  }

  return buildDbOptions({ host, port, username, password, database, ssl: sslEnabled });
}
