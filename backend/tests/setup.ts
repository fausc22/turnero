import dotenv from 'dotenv';
import path from 'path';
import { closeAdminPool } from '../src/config/adminDatabase';
import { closeTenantPool } from '../src/config/tenantDatabase';

process.env.NODE_ENV = 'test';

dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * CI_SKIP_DB=true — omite tests que requieren MySQL (integration + http con DB).
 * PLAYWRIGHT=1 — usado por verify-phase9 para incluir E2E.
 */

afterAll(async () => {
  await closeTenantPool();
  await closeAdminPool();
});
