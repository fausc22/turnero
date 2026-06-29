import { RowDataPacket } from 'mysql2/promise';
import { executeAdminQuery, executeAdminMutation } from '../../config/adminDatabase';
import type { ProvisioningRunRow } from '../../types/super';

export async function createProvisioningRun(
  tenantId: number,
  requestedBy: number | null
): Promise<number> {
  const result = await executeAdminMutation(
    `INSERT INTO tenant_provisioning_runs (tenant_id, status, started_at, requested_by)
     VALUES (?, 'pending', NOW(), ?)`,
    [tenantId, requestedBy]
  );
  return result.insertId;
}

export async function markProvisioningSuccess(runId: number): Promise<void> {
  await executeAdminQuery(
    `UPDATE tenant_provisioning_runs
     SET status = 'success', error_message = NULL, finished_at = NOW()
     WHERE id = ?`,
    [runId]
  );
}

export async function markProvisioningError(runId: number, errorMessage: string): Promise<void> {
  await executeAdminQuery(
    `UPDATE tenant_provisioning_runs
     SET status = 'error', error_message = ?, finished_at = NOW()
     WHERE id = ?`,
    [String(errorMessage).slice(0, 5000), runId]
  );
}

export async function listByTenant(tenantId: number): Promise<ProvisioningRunRow[]> {
  return executeAdminQuery<(ProvisioningRunRow & RowDataPacket)[]>(
    `SELECT id, tenant_id, status, error_message, started_at, finished_at, requested_by
     FROM tenant_provisioning_runs WHERE tenant_id = ? ORDER BY id DESC`,
    [tenantId]
  );
}

export async function findLatestByTenant(tenantId: number): Promise<ProvisioningRunRow | null> {
  const rows = await executeAdminQuery<(ProvisioningRunRow & RowDataPacket)[]>(
    `SELECT id, tenant_id, status, error_message, started_at, finished_at, requested_by
     FROM tenant_provisioning_runs WHERE tenant_id = ? ORDER BY id DESC LIMIT 1`,
    [tenantId]
  );
  return rows[0] ?? null;
}
