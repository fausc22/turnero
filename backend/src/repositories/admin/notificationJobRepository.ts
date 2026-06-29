import { RowDataPacket } from 'mysql2/promise';
import { executeAdminMutation, executeAdminQuery } from '../../config/adminDatabase';

export type NotificationJobStatus = 'pending' | 'processing' | 'sent' | 'failed';
export type NotificationCanal = 'whatsapp' | 'email';

export interface NotificationJobRow {
  id: number;
  tenant_slug: string;
  turno_id: number | null;
  tipo: string;
  canal: NotificationCanal;
  telefono: string | null;
  email: string | null;
  payload: Record<string, unknown>;
  status: NotificationJobStatus;
  retries: number;
  last_error: string | null;
  created_at: Date;
  processed_at: Date | null;
}

export interface EnqueueJobInput {
  tenantSlug: string;
  turnoId?: number | null;
  tipo: string;
  canal: NotificationCanal;
  telefono?: string | null;
  email?: string | null;
  payload: Record<string, unknown>;
}

function parseRow(row: NotificationJobRow & RowDataPacket): NotificationJobRow {
  if (row.payload && typeof row.payload === 'string') {
    row.payload = JSON.parse(row.payload as unknown as string);
  }
  return row;
}

export async function enqueue(job: EnqueueJobInput): Promise<number> {
  const result = await executeAdminMutation(
    `INSERT INTO notification_jobs (tenant_slug, turno_id, tipo, canal, telefono, email, payload, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      job.tenantSlug,
      job.turnoId ?? null,
      job.tipo,
      job.canal,
      job.telefono ?? null,
      job.email ?? null,
      JSON.stringify(job.payload),
    ]
  );
  return result.insertId;
}

export async function claimNext(batch = 1): Promise<NotificationJobRow[]> {
  const connection = await import('../../config/adminDatabase').then((m) => m.getAdminConnection());
  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute<(NotificationJobRow & RowDataPacket)[]>(
      `SELECT id, tenant_slug, turno_id, tipo, canal, telefono, email, payload, status, retries, last_error, created_at, processed_at
       FROM notification_jobs
       WHERE status = 'pending'
       ORDER BY created_at ASC
       LIMIT ?
       FOR UPDATE SKIP LOCKED`,
      [batch]
    );

    if (!rows.length) {
      await connection.commit();
      return [];
    }

    const ids = rows.map((r) => r.id);
    await connection.execute(
      `UPDATE notification_jobs SET status = 'processing' WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    await connection.commit();
    return rows.map(parseRow);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function markSent(id: number): Promise<void> {
  await executeAdminMutation(
    `UPDATE notification_jobs SET status = 'sent', processed_at = NOW(), last_error = NULL WHERE id = ?`,
    [id]
  );
}

export async function markFailed(id: number, error: string): Promise<void> {
  await executeAdminMutation(
    `UPDATE notification_jobs SET status = 'failed', last_error = ?, processed_at = NOW() WHERE id = ?`,
    [error.slice(0, 2000), id]
  );
}

export async function incrementRetry(id: number, error: string): Promise<number> {
  await executeAdminMutation(
    `UPDATE notification_jobs SET retries = retries + 1, status = 'pending', last_error = ? WHERE id = ?`,
    [error.slice(0, 2000), id]
  );
  const rows = await executeAdminQuery<(RowDataPacket & { retries: number })[]>(
    `SELECT retries FROM notification_jobs WHERE id = ?`,
    [id]
  );
  return rows[0]?.retries ?? 0;
}

export async function resetToPending(id: number): Promise<void> {
  await executeAdminMutation(
    `UPDATE notification_jobs SET status = 'pending', processed_at = NULL WHERE id = ?`,
    [id]
  );
}

export async function countByStatus(
  tenantSlug: string,
  status: NotificationJobStatus
): Promise<number> {
  const rows = await executeAdminQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(*) AS cnt FROM notification_jobs WHERE tenant_slug = ? AND status = ?`,
    [tenantSlug, status]
  );
  return rows[0]?.cnt ?? 0;
}

export async function countByTurnoAndTipo(
  turnoId: number,
  tipo: string
): Promise<number> {
  const rows = await executeAdminQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(*) AS cnt FROM notification_jobs WHERE turno_id = ? AND tipo = ?`,
    [turnoId, tipo]
  );
  return rows[0]?.cnt ?? 0;
}
