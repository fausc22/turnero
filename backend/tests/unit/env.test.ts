import { loadEnv, resetEnvCache } from '../../src/config/env';

describe('env validation', () => {
  const base = {
    NODE_ENV: 'development',
    JWT_SECRET: 'dev-jwt-change-me-min-32-chars!!',
    JWT_REFRESH_SECRET: 'dev-refresh-change-me-min-32!!',
    SUPER_JWT_SECRET: 'dev-super-jwt-change-me-min-32!!!',
    SUPER_JWT_REFRESH_SECRET: 'dev-super-refresh-change-me-min-32',
    RESERVATION_TOKEN_SECRET: 'dev-reservation-token-secret!!',
  };

  afterEach(() => {
    resetEnvCache();
  });

  it('acepta development con secrets de ejemplo', () => {
    const env = loadEnv({ ...base } as NodeJS.ProcessEnv);
    expect(env.NODE_ENV).toBe('development');
    expect(env.legacyApiEnabled).toBe(true);
  });

  it('rechaza production con JWT corto', () => {
    expect(() =>
      loadEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_SECRET: 'short',
        DB_PASSWORD: 'x',
        DEV_UNLIMITED: 'false',
        LEGACY_API_ENABLED: 'false',
      } as NodeJS.ProcessEnv)
    ).toThrow(/Production env rejected/);
  });

  it('rechaza production con DEV_UNLIMITED=true', () => {
    expect(() =>
      loadEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_SECRET: 'a'.repeat(32),
        JWT_REFRESH_SECRET: 'b'.repeat(32),
        SUPER_JWT_SECRET: 'c'.repeat(32),
        SUPER_JWT_REFRESH_SECRET: 'd'.repeat(32),
        RESERVATION_TOKEN_SECRET: 'e'.repeat(32),
        DB_PASSWORD: 'secret',
        DEV_UNLIMITED: 'true',
        LEGACY_API_ENABLED: 'false',
      } as NodeJS.ProcessEnv)
    ).toThrow(/DEV_UNLIMITED/);
  });

  it('deshabilita legacy por defecto en production', () => {
    const env = loadEnv({
      ...base,
      NODE_ENV: 'production',
      JWT_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
      SUPER_JWT_SECRET: 'c'.repeat(32),
      SUPER_JWT_REFRESH_SECRET: 'd'.repeat(32),
      RESERVATION_TOKEN_SECRET: 'e'.repeat(32),
      DB_PASSWORD: 'secret',
      DEV_UNLIMITED: 'false',
    } as NodeJS.ProcessEnv);
    expect(env.legacyApiEnabled).toBe(false);
    expect(env.runCronsInApi).toBe(false);
  });
});
