import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Verifies the `npm run start:prod` fail-fast chain:
 *
 *   "start:prod": "node dist/src/config/check-env.js && node dist/src/main.js"
 *
 * The `&&` operator guarantees that `check-env.js` runs FIRST and that
 * `main.js` (the NestJS app) is only executed when the environment check
 * passes. On an incomplete environment the process must exit non-zero
 * WITHOUT ever booting the application.
 */

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const CHECK_ENV_JS = path.join(BACKEND_ROOT, 'dist', 'src', 'config', 'check-env.js');

// Every variable validateEnv() can require (DB block + production-only).
const REQUIRED_VARS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_PASS',
  'DATABASE_PASSWORD',
  'MYSQL_PASSWORD',
  'MYSQL_ROOT_PASSWORD',
  'TIDB_PASSWORD',
  'MYSQL_PWD',
  'DB_NAME',
  'DB_DATABASE',
  'JWT_SECRET',
  'FRONTEND_URL',
  'DB_SSL',
];

/** Env with NO_DOTENV=1 and every required DB/production var stripped. */
function cleanEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  // Strip inherited required vars FIRST, then apply the test's own values,
  // so tests can provide a complete/invalid env without losing those vars.
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const key of REQUIRED_VARS) delete env[key];
  return { ...env, NO_DOTENV: '1', ...extra };
}

interface RunResult {
  status: number;
  stdout: string;
  stderr: string;
}

function runNpm(script: string, env: NodeJS.ProcessEnv): RunResult {
  // Use execSync (shell-resolved) rather than execFileSync('npm.cmd', ...):
  // on Windows via nvm the npm shim is not a .cmd file and execFileSync would
  // fail with EINVAL, while execSync resolves npm through the shell correctly.
  try {
    const stdout = execSync(`npm run ${script}`, {
      cwd: BACKEND_ROOT,
      env,
      encoding: 'utf8',
      timeout: 60_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return {
      status: e.status ?? 1,
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
    };
  }
}

beforeAll(() => {
  // start:prod runs the COMPILED check-env gate, so make sure dist exists.
  if (!fs.existsSync(CHECK_ENV_JS)) {
    execSync('npm run build', {
      cwd: BACKEND_ROOT,
      stdio: 'pipe',
      timeout: 180_000,
    });
  }
}, 200_000);

jest.setTimeout(60_000);

describe('start:prod fail-fast chain', () => {
  it('runs check-env before main (&& short-circuit) in the start:prod script', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(BACKEND_ROOT, 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };

    expect(pkg.scripts['start:prod']).toBe(
      'node dist/src/config/check-env.js && node dist/src/main.js',
    );
  });

  it('fails fast with exit code 1 and never boots the app when the env is incomplete', () => {
    const result = runNpm('start:prod', cleanEnv());

    const output = result.stdout + result.stderr;

    // check-env gate must fail → non-zero exit
    expect(result.status).toBe(1);

    // the exact missing-vars error must be surfaced
    expect(output).toContain('[Config] ❌ Missing required environment variable(s)');

    // && short-circuits → the NestJS app must NOT have booted
    expect(output).not.toContain('Nest application successfully started');
    expect(output).not.toContain('POS API running');
  });

  it('exits 0 when the production environment is complete (check:env:prod)', () => {
    const result = runNpm(
      'check:env:prod',
      cleanEnv({
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_USER: 'pos_user',
        DB_PASSWORD: 'pos_password',
        DB_NAME: 'pos_db',
        DB_SSL: 'false',
        JWT_SECRET: 'test-secret',
        FRONTEND_URL: 'http://localhost:4200',
      }),
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      '✅ check:env:prod — all required production environment variables are present.',
    );
  });

  it('fails fast on an invalid DB_PORT value', () => {
    const result = runNpm(
      'start:prod',
      cleanEnv({
        DB_HOST: 'localhost',
        DB_PORT: 'not-a-number',
        DB_USER: 'pos_user',
        DB_PASSWORD: 'pos_password',
        DB_NAME: 'pos_db',
        DB_SSL: 'false',
        JWT_SECRET: 'test-secret',
        FRONTEND_URL: 'http://localhost:4200',
      }),
    );

    const output = result.stdout + result.stderr;
    expect(result.status).toBe(1);
    expect(output).toContain('[Config] ❌ DB_PORT must be a number');
    expect(output).not.toContain('Nest application successfully started');
  });

  it('fails fast on an invalid DB_SSL value', () => {
    const result = runNpm(
      'start:prod',
      cleanEnv({
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_USER: 'pos_user',
        DB_PASSWORD: 'pos_password',
        DB_NAME: 'pos_db',
        DB_SSL: 'yes',
        JWT_SECRET: 'test-secret',
        FRONTEND_URL: 'http://localhost:4200',
      }),
    );

    const output = result.stdout + result.stderr;
    expect(result.status).toBe(1);
    expect(output).toContain('[Config] ❌ DB_SSL must be either "true" or "false".');
    expect(output).not.toContain('Nest application successfully started');
  });
});
