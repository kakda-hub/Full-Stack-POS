/**
 * Runtime environment validation for ConfigModule.
 *
 * Fails fast at startup when required environment variables are missing,
 * so the application never boots into a misconfigured state.
 *
 * Development (master) requires the database block.
 * Production (main, Render) additionally requires JWT_SECRET and FRONTEND_URL.
 */

const PASSWORD_ALIASES = [
  'DB_PASSWORD',
  'DB_PASS',
  'DATABASE_PASSWORD',
  'MYSQL_PASSWORD',
  'MYSQL_ROOT_PASSWORD',
  'TIDB_PASSWORD',
  'MYSQL_PWD',
];

// Username / database may use alternative naming conventions on some hosts.
const USER_ALIASES = ['DB_USER', 'DB_USERNAME'];
const DATABASE_ALIASES = ['DB_NAME', 'DB_DATABASE'];

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const nodeEnv = (config.NODE_ENV as string) || 'development';
  const isProduction = nodeEnv === 'production';

  const missing: string[] = [];

  // Database connection is always required to boot the application
  const hasAny = (keys: string[]): boolean =>
    keys.some((key) => {
      const value = config[key];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });

  if (!hasAny(USER_ALIASES)) missing.push('DB_USER (or DB_USERNAME)');
  if (!hasAny(DATABASE_ALIASES)) missing.push('DB_NAME (or DB_DATABASE)');
  for (const key of ['DB_HOST', 'DB_PORT']) {
    const value = config[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      missing.push(key);
    }
  }

  // At least one password source must be present
  if (!hasAny(PASSWORD_ALIASES)) {
    missing.push('DB_PASSWORD (or DB_PASS / DATABASE_PASSWORD / MYSQL_PASSWORD)');
  }

  // Production-only requirements (Render / TiDB Cloud)
  if (isProduction) {
    for (const key of ['JWT_SECRET', 'FRONTEND_URL', 'DB_SSL']) {
      const value = config[key];
      if (value === undefined || value === null || String(value).trim() === '') {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[Config] ❌ Missing required environment variable(s): ${missing.join(', ')}.\n` +
        '  → Development (master): copy pos-backend/.env.example to pos-backend/.env and fill it in.\n' +
        '  → Production (main): set these variables in the Render dashboard → Environment tab.',
    );
  }

  // DB_PORT must be numeric
  if (Number.isNaN(Number(config.DB_PORT))) {
    throw new Error(
      '[Config] ❌ DB_PORT must be a number (e.g. 3306 for local MySQL, 4000 for TiDB Cloud).',
    );
  }

  // DB_SSL must be a valid boolean string
  const dbSsl = config.DB_SSL;
  if (
    dbSsl !== undefined &&
    dbSsl !== null &&
    !['true', 'false'].includes(String(dbSsl).trim())
  ) {
    throw new Error('[Config] ❌ DB_SSL must be either "true" or "false".');
  }

  return config;
}
