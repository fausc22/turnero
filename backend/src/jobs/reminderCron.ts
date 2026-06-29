import { listTenants } from '../repositories/admin/tenantRepository';
import { runWithTenantContext } from '../context/tenantContext';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as enviadaRepo from '../repositories/tenant/notificacionEnviadaRepository';
import { enqueueForTurno } from '../services/notificationEnqueueService';
import logger from '../config/logger';

function featureEnabled(config: { features?: Record<string, unknown> }, key: string): boolean {
  const features = config.features as Record<string, unknown> | undefined;
  if (features && key in features) return Boolean(features[key]);
  return key === 'recordatorio_24h';
}

async function sendRemindersInWindow(
  tenantSlug: string,
  tipo: 'recordatorio_24h' | 'recordatorio_2h',
  hoursAhead: number,
  windowMinutes: number
): Promise<number> {
  const now = new Date();
  const center = new Date(now.getTime() + hoursAhead * 60 * 60_000);
  const from = new Date(center.getTime() - windowMinutes * 60_000);
  const to = new Date(center.getTime() + windowMinutes * 60_000);

  const turnos = await turnoRepo.findConfirmedInRange(from, to);
  let sent = 0;

  for (const turno of turnos) {
    if (await enviadaRepo.wasSent(turno.id, tipo)) continue;
    await enqueueForTurno({ tenantSlug, turnoId: turno.id, tipo });
    sent += 1;
  }

  return sent;
}

export async function sendReminders24h(): Promise<void> {
  const tenants = await listTenants({ status: 'activo' });

  for (const tenant of tenants) {
    if (!tenant.db_name) continue;
    const config = tenant.config_json ?? {};
    if (!featureEnabled(config, 'recordatorio_24h')) continue;

    try {
      const count = await runWithTenantContext(
        {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantDbName: tenant.db_name,
          plan: tenant.plan,
          pageStatus: tenant.page_status,
          config,
        },
        () => sendRemindersInWindow(tenant.slug, 'recordatorio_24h', 24, 15)
      );

      if (count > 0) {
        logger.info(`reminderCron 24h: ${tenant.slug} — ${count} jobs encolados`);
      }
    } catch (err) {
      logger.error(`reminderCron 24h error en ${tenant.slug}`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export async function sendReminders2h(): Promise<void> {
  const tenants = await listTenants({ status: 'activo' });

  for (const tenant of tenants) {
    if (!tenant.db_name) continue;
    const config = tenant.config_json ?? {};
    if (!featureEnabled(config, 'recordatorio_2h')) continue;

    try {
      const count = await runWithTenantContext(
        {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantDbName: tenant.db_name,
          plan: tenant.plan,
          pageStatus: tenant.page_status,
          config,
        },
        () => sendRemindersInWindow(tenant.slug, 'recordatorio_2h', 2, 15)
      );

      if (count > 0) {
        logger.info(`reminderCron 2h: ${tenant.slug} — ${count} jobs encolados`);
      }
    } catch (err) {
      logger.error(`reminderCron 2h error en ${tenant.slug}`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export async function runReminderCron(): Promise<void> {
  await sendReminders24h();
  await sendReminders2h();
}

export function startReminderCronJob(): void {
  const intervalMs = 15 * 60_000;
  void runReminderCron();
  setInterval(() => {
    void runReminderCron();
  }, intervalMs);
  logger.info('Job reminderCron registrado (cada 15 min)');
}
