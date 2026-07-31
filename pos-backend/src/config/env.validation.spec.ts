import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  // ─── Case 1: missing required variables ──────────────────────────────────
  describe('when required variables are missing', () => {
    it('throws listing all missing development variables', () => {
      expect(() => validateEnv({ NODE_ENV: 'development' })).toThrow(
        '[Config] ❌ Missing required environment variable(s): ' +
          'DB_USER (or DB_USERNAME), DB_NAME (or DB_DATABASE), DB_HOST, DB_PORT, ' +
          'DB_PASSWORD (or DB_PASS / DATABASE_PASSWORD / MYSQL_PASSWORD).',
      );
    });

    it('throws listing production-only requirements when NODE_ENV=production', () => {
      expect(() =>
        validateEnv({
          NODE_ENV: 'production',
          DB_HOST: 'gateway01.example.com',
          DB_PORT: '4000',
          DB_USER: 'user',
          DB_PASSWORD: 'pass',
          DB_NAME: 'pos_db',
          // JWT_SECRET, FRONTEND_URL, DB_SSL intentionally missing
        }),
      ).toThrow(
        '[Config] ❌ Missing required environment variable(s): JWT_SECRET, FRONTEND_URL, DB_SSL.',
      );
    });

    it('accepts the DB_PASS alias instead of DB_PASSWORD', () => {
      const config = {
        NODE_ENV: 'development',
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_USER: 'pos_user',
        DB_PASS: 'pos_password',
        DB_NAME: 'pos_db',
      };
      expect(() => validateEnv(config)).not.toThrow();
      expect(validateEnv(config)).toBe(config);
    });

    it('accepts the DB_USERNAME and DB_DATABASE aliases', () => {
      const config = {
        NODE_ENV: 'development',
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_USERNAME: 'pos_user',
        DB_PASSWORD: 'pos_password',
        DB_DATABASE: 'pos_db',
      };
      expect(() => validateEnv(config)).not.toThrow();
    });
  });

  // ─── Case 2: bad DB_PORT ────────────────────────────────────────────────
  describe('DB_PORT', () => {
    it('throws when DB_PORT is not a number', () => {
      expect(() =>
        validateEnv({
          NODE_ENV: 'development',
          DB_HOST: 'localhost',
          DB_PORT: 'abc',
          DB_USER: 'pos_user',
          DB_PASSWORD: 'pos_password',
          DB_NAME: 'pos_db',
        }),
      ).toThrow(
        '[Config] ❌ DB_PORT must be a number (e.g. 3306 for local MySQL, 4000 for TiDB Cloud).',
      );
    });

    it('accepts a numeric DB_PORT', () => {
      const config = {
        NODE_ENV: 'development',
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_USER: 'pos_user',
        DB_PASSWORD: 'pos_password',
        DB_NAME: 'pos_db',
      };
      expect(() => validateEnv(config)).not.toThrow();
    });
  });

  // ─── Case 3: bad DB_SSL ─────────────────────────────────────────────────
  describe('DB_SSL', () => {
    it('throws when DB_SSL is not "true" or "false"', () => {
      expect(() =>
        validateEnv({
          NODE_ENV: 'development',
          DB_HOST: 'localhost',
          DB_PORT: '3306',
          DB_USER: 'pos_user',
          DB_PASSWORD: 'pos_password',
          DB_NAME: 'pos_db',
          DB_SSL: 'yes',
        }),
      ).toThrow('[Config] ❌ DB_SSL must be either "true" or "false".');
    });

    it('accepts valid boolean strings in production', () => {
      const config = {
        NODE_ENV: 'production',
        DB_HOST: 'localhost',
        DB_PORT: '3306',
        DB_USER: 'pos_user',
        DB_PASSWORD: 'pos_password',
        DB_NAME: 'pos_db',
        DB_SSL: 'false',
        JWT_SECRET: 'super-secret',
        FRONTEND_URL: 'http://localhost:4200',
      };
      expect(() => validateEnv(config)).not.toThrow();
    });
  });

  // ─── Happy path ─────────────────────────────────────────────────────────
  it('returns the config unchanged when everything is valid (development)', () => {
    const config = {
      NODE_ENV: 'development',
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_USER: 'pos_user',
      DB_PASSWORD: 'pos_password',
      DB_NAME: 'pos_db',
    };
    expect(validateEnv(config)).toBe(config);
  });
});
