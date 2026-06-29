import * as auditRepo from '../repositories/admin/platformAuditRepository';

export async function logPlatformEvent(data: {
  superUsuarioId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  payload?: Record<string, unknown> | null;
}): Promise<void> {
  await auditRepo.insertPlatformAudit({
    superUsuarioId: data.superUsuarioId,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    payload: data.payload,
  });
}
