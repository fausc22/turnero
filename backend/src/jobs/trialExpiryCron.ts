import { listTenants, updateTenant } from '../repositories/admin/tenantRepository';
import { logPlatformEvent } from '../services/platformAuditService';
import logger from '../config/logger';

export async function processTrialExpiry(): Promise<void> {
  const tenants = await listTenants({ plan: 'trial', status: 'activo' });
  const now = new Date();

  for (const tenant of tenants) {
    if (!tenant.trial_ends_at) continue;
    const endsAt = new Date(tenant.trial_ends_at);
    if (endsAt > now) continue;
    if (tenant.page_status === 'PAUSADA') continue;

    await updateTenant(tenant.id, { page_status: 'PAUSADA' });
    await logPlatformEvent({
      action: 'trial.expired',
      entityType: 'tenant',
      entityId: tenant.id,
      payload: { slug: tenant.slug, trialEndsAt: endsAt.toISOString() },
    });
    logger.info(`trialExpiryCron: ${tenant.slug} → page_status PAUSADA`);
  }
}

export function startTrialExpiryCronJob(): void {
  void processTrialExpiry();
  const intervalMs = process.env.NODE_ENV === 'development' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  setInterval(() => {
    void processTrialExpiry();
  }, intervalMs);
  logger.info(`Job trialExpiryCron registrado (cada ${intervalMs / 60000} min)`);
}
