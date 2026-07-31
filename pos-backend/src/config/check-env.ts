/**
 * Production environment sanity check (for CI / pre-deploy checks).
 *
 * Runs the exact same validateEnv() used by the application at startup, but
 * forced into "production" mode and WITHOUT booting NestJS or connecting to a
 * database. Exits with a non-zero code when any required production variable
 * is missing or invalid, so CI pipelines can fail fast before deploying.
 *
 *   npm run check:env:prod
 *
 * The check also runs automatically as part of `npm run start:prod`, so a
 * production boot never proceeds with a broken environment.
 *
 * Optionally, set NO_DOTENV=1 to ignore any local .env file (useful on CI
 * machines where you only want to rely on injected environment variables).
 */
import * as fs from 'fs';
import * as path from 'path';
import { validateEnv } from './env.validation';

// Mirror the .env loading used by reset-migration.js / run-sql-seed.js so the
// check works locally too, not only in CI. Existing process.env values win
// (dotenv semantics), and NO_DOTENV=1 disables loading entirely.
if (process.env.NO_DOTENV !== '1') {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach((line) => {
      if (line.trim().startsWith('#') || !line.includes('=')) return;
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key.trim() && !process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    });
  }
}

// This script exists to validate a PRODUCTION environment, so NODE_ENV is
// forced to "production" regardless of what the caller set.
process.env.NODE_ENV = 'production';

try {
  validateEnv(process.env);
  console.log(
    '✅ check:env:prod — all required production environment variables are present.',
  );
  console.log(
    `   DB=${process.env.DB_HOST}:${process.env.DB_PORT} DB_SSL=${process.env.DB_SSL} ` +
      `JWT_SECRET=${process.env.JWT_SECRET ? 'set' : 'missing'} ` +
      `FRONTEND_URL=${process.env.FRONTEND_URL || 'missing'}`,
  );
  process.exit(0);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  console.error('❌ check:env:prod — production environment is incomplete.');
  process.exit(1);
}
