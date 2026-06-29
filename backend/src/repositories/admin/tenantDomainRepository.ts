import { RowDataPacket } from 'mysql2/promise';
import { executeAdminQuery, executeAdminMutation } from '../../config/adminDatabase';

export interface TenantDomainRow {
  id: number;
  tenant_id: number;
  domain: string;
  is_primary: number;
}

export async function createTenantDomain(
  tenantId: number,
  domain: string,
  isPrimary = true
): Promise<number> {
  const result = await executeAdminMutation(
    `INSERT INTO tenant_domains (tenant_id, domain, is_primary) VALUES (?, ?, ?)`,
    [tenantId, domain, isPrimary ? 1 : 0]
  );
  return result.insertId;
}

export async function listByTenant(tenantId: number): Promise<TenantDomainRow[]> {
  return executeAdminQuery<(TenantDomainRow & RowDataPacket)[]>(
    `SELECT id, tenant_id, domain, is_primary FROM tenant_domains WHERE tenant_id = ?`,
    [tenantId]
  );
}
