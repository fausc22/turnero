import { RowDataPacket } from 'mysql2/promise';
import { executeAdminQuery } from '../../config/adminDatabase';
import type { TenantUserIndexRow } from '../../types/super';

export async function findByEmail(email: string): Promise<TenantUserIndexRow | null> {
  const rows = await executeAdminQuery<(TenantUserIndexRow & RowDataPacket)[]>(
    `SELECT id, tenant_id, tenant_slug, email, usuario_id
     FROM tenant_user_index WHERE email = ? LIMIT 1`,
    [email.toLowerCase()]
  );
  return rows[0] ?? null;
}

export async function upsertIndex(data: {
  tenantId: number;
  tenantSlug: string;
  email: string;
  usuarioId: number;
}): Promise<void> {
  await executeAdminQuery(
    `INSERT INTO tenant_user_index (tenant_id, tenant_slug, email, usuario_id)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       tenant_id = VALUES(tenant_id),
       tenant_slug = VALUES(tenant_slug),
       usuario_id = VALUES(usuario_id),
       updated_at = NOW()`,
    [data.tenantId, data.tenantSlug, data.email.toLowerCase(), data.usuarioId]
  );
}

export async function removeByEmail(email: string): Promise<void> {
  await executeAdminQuery(`DELETE FROM tenant_user_index WHERE email = ?`, [email.toLowerCase()]);
}

export async function removeByTenant(tenantId: number): Promise<void> {
  await executeAdminQuery(`DELETE FROM tenant_user_index WHERE tenant_id = ?`, [tenantId]);
}
