import { listTenants } from '../repositories/admin/tenantRepository';
import { runWithTenantContext } from '../context/tenantContext';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import logger from '../config/logger';

const EXPIRE_MINUTES = 30;

export async function expirePendingTurnos(): Promise<void> {
  const tenants = await listTenants({ status: 'activo' });

  for (const tenant of tenants) {
    if (!tenant.db_name) continue;

    try {
      const affected = await runWithTenantContext(
        {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantDbName: tenant.db_name,
          plan: tenant.plan,
          pageStatus: tenant.page_status,
          config: tenant.config_json ?? {},
        },
        () => turnoRepo.expirePendingOlderThan(EXPIRE_MINUTES)
      );

      if (affected > 0) {
        logger.info(`expirePendingTurnos: ${tenant.slug} — ${affected} turnos cancelados`);
      }
    } catch (err) {
      logger.error(`expirePendingTurnos error en ${tenant.slug}`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export function startExpirePendingTurnosJob(): void {
  const intervalMs = 5 * 60_000;
  void expirePendingTurnos();
  setInterval(() => {
    void expirePendingTurnos();
  }, intervalMs);
  logger.info('Job expirePendingTurnos registrado (cada 5 min)');
}
