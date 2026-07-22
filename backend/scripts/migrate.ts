#!/usr/bin/env tsx
/**
 * Runner de migraciones versionadas admin + todos los tenants.
 *
 * Uso:
 *   npm run migrate -w backend -- plan
 *   npm run migrate -w backend -- dry-run
 *   npm run migrate -w backend -- apply
 *   npm run migrate -w backend -- apply --tenant=peluqueria-naz
 *   npm run migrate -w backend -- apply --scope=admin
 */
import path from 'path';
import dotenv from 'dotenv';
import { buildMigrationPlan, applyMigrations } from '../src/services/migrationService';
import { closeAdminPool } from '../src/config/adminDatabase';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0] || 'plan';
  const tenantArg = args.find((a) => a.startsWith('--tenant='));
  const scopeArg = args.find((a) => a.startsWith('--scope='));
  const tenantSlug = tenantArg?.split('=')[1];
  const scope = (scopeArg?.split('=')[1] as 'admin' | 'tenant' | 'all' | undefined) || 'all';

  if (cmd === 'plan' || cmd === 'dry-run') {
    const plan = await buildMigrationPlan({ tenantSlug, scope });
    const pending = plan.filter((p) => p.status === 'pending');
    const applied = plan.filter((p) => p.status === 'applied');
    const mismatch = plan.filter((p) => p.status === 'checksum_mismatch');
    console.log(JSON.stringify({ pending, applied: applied.length, mismatch }, null, 2));
    if (mismatch.length) process.exitCode = 2;
    else if (cmd === 'dry-run') {
      console.log(`Dry-run: ${pending.length} pending, ${applied.length} already applied`);
    }
    return;
  }

  if (cmd === 'apply') {
    const result = await applyMigrations({
      dryRun: false,
      tenantSlug,
      scope,
    });
    console.log(
      JSON.stringify(
        {
          applied: result.applied.map((a) => `${a.scope}:${a.tenantSlug || 'admin'}:${a.version}`),
          skipped: result.skipped.length,
          errors: result.errors,
        },
        null,
        2
      )
    );
    if (result.errors.length) process.exitCode = 1;
    return;
  }

  console.error('Usage: migrate <plan|dry-run|apply> [--tenant=slug] [--scope=admin|tenant|all]');
  process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeAdminPool();
  });
