import { AsyncLocalStorage } from 'async_hooks';
import type { TenantContext, TenantPlan, PageStatus } from '../types/tenant';

const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function runWithTenantContext<T>(
  context: Partial<TenantContext> & Pick<TenantContext, 'tenantId' | 'tenantSlug' | 'tenantDbName'>,
  fn: () => T
): T {
  const full: TenantContext = {
    tenantId: context.tenantId,
    tenantSlug: context.tenantSlug,
    tenantDbName: context.tenantDbName,
    plan: (context.plan as TenantPlan) ?? 'trial',
    pageStatus: (context.pageStatus as PageStatus) ?? 'ACTIVA',
    config: context.config ?? {},
  };
  return tenantStorage.run(full, fn);
}

export function getTenantContext(): TenantContext | null {
  return tenantStorage.getStore() ?? null;
}

export function requireTenantContext(): TenantContext {
  const ctx = getTenantContext();
  if (!ctx) {
    throw new Error('No hay contexto de tenant activo');
  }
  return ctx;
}

export { tenantStorage };
