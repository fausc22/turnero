import { z } from 'zod';

const PLACEHOLDER_JWT = [
  'secret',
  'refresh_secret',
  'dev-jwt-change-me-min-32-chars!!',
  'dev-refresh-change-me-min-32!!',
  'dev-super-jwt-change-me-min-32!!!',
  'dev-super-refresh-change-me-min-32',
  'dev-reservation-token-secret!!',
];

function isWeakSecret(value: string): boolean {
  if (value.length < 32) return true;
  return PLACEHOLDER_JWT.includes(value);
}

/** undefined = unset (apply defaults); true/false = explicit */
const boolish = z
  .string()
  .optional()
  .transform((v): boolean | undefined => {
    if (v === undefined || v === '') return undefined;
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
    return undefined;
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4013'),

  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_ADMIN_NAME: z.string().default('tuturno_admin'),
  DB_LEGACY_NAME: z.string().default('turnero'),
  DB_TENANT_POOL_LIMIT: z.string().default('10'),

  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_REMEMBER_EXPIRES_IN: z.string().default('30d'),

  SUPER_JWT_SECRET: z.string().optional(),
  SUPER_JWT_REFRESH_SECRET: z.string().optional(),
  SUPER_JWT_EXPIRES_IN: z.string().default('8h'),
  SUPER_JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  RESERVATION_TOKEN_SECRET: z.string().optional(),

  BASE_DOMAIN: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  API_PUBLIC_URL: z.string().optional(),
  API_URL: z.string().optional(),
  CLIENT_BASE_HOST: z.string().optional(),
  CLIENT_BASE_SCHEME: z.string().optional(),

  PUBLIC_RATE_LIMIT: z.string().default('60'),
  AUTH_RATE_LIMIT: z.string().default('10'),
  WEBHOOK_RATE_LIMIT: z.string().default('120'),
  TRUST_PROXY_HOPS: z.string().default('1'),
  BODY_LIMIT: z.string().default('1mb'),

  DEV_UNLIMITED: boolish,
  LEGACY_API_ENABLED: boolish,
  RUN_CRONS_IN_API: boolish,
  REQUIRE_RESERVATION_SIG: boolish,

  MP_WEBHOOK_SECRET: z.string().optional(),
  MP_TEST_ACCESS_TOKEN: z.string().optional(),
  MP_CREDENTIALS_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  OPENCAGE_API_KEY: z.string().optional(),
  UPLOADS_PATH: z.string().optional(),
  BAILEYS_AUTH_PATH: z.string().optional(),
  WORKER_ID: z.string().optional(),
  SCHEDULER_ENABLED: boolish,
  SCHEDULER_LOCK_NAME: z.string().default('tuturno-scheduler'),
});

export type AppEnv = z.infer<typeof envSchema> & {
  isProduction: boolean;
  isTest: boolean;
  jwtSecret: string;
  jwtRefreshSecret: string;
  superJwtSecret: string;
  superJwtRefreshSecret: string;
  reservationTokenSecret: string;
  legacyApiEnabled: boolean;
  runCronsInApi: boolean;
  requireReservationSig: boolean;
};

let cached: AppEnv | null = null;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(details)}`);
  }

  const data = parsed.data;
  const isProduction = data.NODE_ENV === 'production';
  const isTest = data.NODE_ENV === 'test';

  const jwtSecret = data.JWT_SECRET || (isProduction ? '' : 'dev-jwt-change-me-min-32-chars!!');
  const jwtRefreshSecret =
    data.JWT_REFRESH_SECRET || (isProduction ? '' : 'dev-refresh-change-me-min-32!!');
  const superJwtSecret =
    data.SUPER_JWT_SECRET || (isProduction ? '' : 'dev-super-jwt-change-me-min-32!!!');
  const superJwtRefreshSecret =
    data.SUPER_JWT_REFRESH_SECRET || (isProduction ? '' : 'dev-super-refresh-change-me-min-32');
  const reservationTokenSecret =
    data.RESERVATION_TOKEN_SECRET || (isProduction ? '' : 'dev-reservation-token-secret!!');

  if (isProduction) {
    const missing: string[] = [];
    if (!data.JWT_SECRET || isWeakSecret(data.JWT_SECRET)) missing.push('JWT_SECRET');
    if (!data.JWT_REFRESH_SECRET || isWeakSecret(data.JWT_REFRESH_SECRET)) {
      missing.push('JWT_REFRESH_SECRET');
    }
    if (!data.SUPER_JWT_SECRET || isWeakSecret(data.SUPER_JWT_SECRET)) {
      missing.push('SUPER_JWT_SECRET');
    }
    if (!data.SUPER_JWT_REFRESH_SECRET || isWeakSecret(data.SUPER_JWT_REFRESH_SECRET)) {
      missing.push('SUPER_JWT_REFRESH_SECRET');
    }
    if (!data.RESERVATION_TOKEN_SECRET || isWeakSecret(data.RESERVATION_TOKEN_SECRET)) {
      missing.push('RESERVATION_TOKEN_SECRET');
    }
    if (!data.DB_PASSWORD) missing.push('DB_PASSWORD');
    if (data.DEV_UNLIMITED === true) missing.push('DEV_UNLIMITED must be false');
    if (missing.length) {
      throw new Error(
        `Production env rejected (weak/missing secrets or unsafe flags): ${missing.join(', ')}`
      );
    }
  }

  // Production: legacy OFF unless explicitly true. Dev/test: ON unless explicitly false.
  const legacyFinal = isProduction
    ? data.LEGACY_API_ENABLED === true
    : data.LEGACY_API_ENABLED !== false;

  // Production: crons OFF in API (scheduler owns them) unless explicitly true.
  // Dev: ON unless explicitly false.
  const cronsFinal = isProduction
    ? data.RUN_CRONS_IN_API === true
    : data.RUN_CRONS_IN_API !== false;

  const requireSig = isProduction
    ? data.REQUIRE_RESERVATION_SIG !== false
    : data.REQUIRE_RESERVATION_SIG === true;

  const env: AppEnv = {
    ...data,
    isProduction,
    isTest,
    jwtSecret,
    jwtRefreshSecret,
    superJwtSecret,
    superJwtRefreshSecret,
    reservationTokenSecret,
    legacyApiEnabled: legacyFinal,
    runCronsInApi: cronsFinal,
    requireReservationSig: requireSig,
    DEV_UNLIMITED: data.DEV_UNLIMITED === true,
    LEGACY_API_ENABLED: legacyFinal,
    RUN_CRONS_IN_API: cronsFinal,
    REQUIRE_RESERVATION_SIG: requireSig,
    SCHEDULER_ENABLED: data.SCHEDULER_ENABLED === true,
  };

  return env;
}

export function getEnv(): AppEnv {
  if (!cached) {
    cached = loadEnv();
  }
  return cached;
}

/** Test helper — reset cache after mutating process.env */
export function resetEnvCache(): void {
  cached = null;
}

export function assertMpWebhookSecretForProduction(env: AppEnv = getEnv()): void {
  if (env.isProduction && !env.MP_WEBHOOK_SECRET) {
    throw new Error('MP_WEBHOOK_SECRET is required when NODE_ENV=production (payments webhooks)');
  }
}
