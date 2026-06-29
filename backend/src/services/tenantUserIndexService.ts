import * as indexRepo from '../repositories/admin/tenantUserIndexRepository';
import type { TenantRow } from '../types/tenant';
import type { TenantUserIndexRow } from '../types/super';

export async function findByEmail(email: string): Promise<TenantUserIndexRow | null> {
  return indexRepo.findByEmail(email);
}

export async function upsertFromTenantUser(
  tenant: Pick<TenantRow, 'id' | 'slug'>,
  usuario: { id: number; email: string }
): Promise<void> {
  await indexRepo.upsertIndex({
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    email: usuario.email,
    usuarioId: usuario.id,
  });
}

export async function removeByEmail(email: string): Promise<void> {
  await indexRepo.removeByEmail(email);
}

export async function removeByTenant(tenantId: number): Promise<void> {
  await indexRepo.removeByTenant(tenantId);
}
