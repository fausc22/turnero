import dotenv from 'dotenv';
import path from 'path';
import { closeAdminPool } from '../src/config/adminDatabase';
import { closeTenantPool } from '../src/config/tenantDatabase';
import { resetEnvCache } from '../src/config/env';

process.env.NODE_ENV = 'test';
process.env.SKIP_ENV_VALIDATION = 'true';

dotenv.config({ path: path.join(__dirname, '../.env') });

// Ensure secrets exist for JWT helpers when .env is missing
process.env.JWT_SECRET ||= 'dev-jwt-change-me-min-32-chars!!';
process.env.JWT_REFRESH_SECRET ||= 'dev-refresh-change-me-min-32!!';
process.env.SUPER_JWT_SECRET ||= 'dev-super-jwt-change-me-min-32!!!';
process.env.SUPER_JWT_REFRESH_SECRET ||= 'dev-super-refresh-change-me-min-32';
process.env.RESERVATION_TOKEN_SECRET ||= 'dev-reservation-token-secret!!';
process.env.LEGACY_API_ENABLED ||= 'true';
process.env.RUN_CRONS_IN_API ||= 'false';

resetEnvCache();

/**
 * CI_SKIP_DB=true — omite tests que requieren MySQL (integration + http con DB).
 * PLAYWRIGHT=1 — usado por verify-phase9 para incluir E2E.
 */

afterAll(async () => {
  await closeTenantPool();
  await closeAdminPool();
});
