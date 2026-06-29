import { findTenantBySlug } from '../../src/repositories/admin/tenantRepository';
import { runWithTenantContext } from '../../src/context/tenantContext';
import type { TenantRow } from '../../src/types/tenant';

let cachedTenant: TenantRow | null = null;

export async function getDemoTenant(): Promise<TenantRow> {
  if (!cachedTenant) {
    const tenant = await findTenantBySlug('peluqueria-naz');
    if (!tenant?.db_name) {
      throw new Error('Tenant demo peluqueria-naz no provisionado. Ejecutá npm run setup:db');
    }
    cachedTenant = tenant;
  }
  return cachedTenant;
}

export async function withDemoTenant<T>(fn: () => Promise<T>): Promise<T> {
  const tenant = await getDemoTenant();
  return runWithTenantContext(
    {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantDbName: tenant.db_name!,
      plan: tenant.plan,
      pageStatus: tenant.page_status,
      config: tenant.config_json ?? {},
    },
    fn
  );
}
