import { RowDataPacket } from 'mysql2/promise';
import { executeAdminQuery, executeAdminMutation } from '../../config/adminDatabase';

export interface PlatformAuditEntry {
  id: number;
  super_usuario_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  payload_json: Record<string, unknown> | null;
  created_at: Date;
}

export async function insertPlatformAudit(data: {
  superUsuarioId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  payload?: Record<string, unknown> | null;
}): Promise<number> {
  const result = await executeAdminMutation(
    `INSERT INTO platform_audit_log (super_usuario_id, action, entity_type, entity_id, payload_json)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.superUsuarioId ?? null,
      data.action,
      data.entityType,
      data.entityId ?? null,
      data.payload ? JSON.stringify(data.payload) : null,
    ]
  );
  return result.insertId;
}

export async function listPlatformAudit(limit = 100): Promise<PlatformAuditEntry[]> {
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
  const rows = await executeAdminQuery<(PlatformAuditEntry & RowDataPacket)[]>(
    `SELECT id, super_usuario_id, action, entity_type, entity_id, payload_json, created_at
     FROM platform_audit_log ORDER BY id DESC LIMIT ${safeLimit}`
  );
  return rows.map((row) => {
    if (row.payload_json && typeof row.payload_json === 'string') {
      row.payload_json = JSON.parse(row.payload_json as unknown as string);
    }
    return row;
  });
}
