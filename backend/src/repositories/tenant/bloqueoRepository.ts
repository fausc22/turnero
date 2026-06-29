import { RowDataPacket, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface BloqueoRow {
  id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  motivo: string | null;
  profesional_id: number | null;
}

export async function findOverlapping(
  fechaInicio: Date,
  fechaFin: Date,
  profesionalId?: number | null,
  conn?: PoolConnection
): Promise<BloqueoRow[]> {
  const sql = `SELECT id, fecha_inicio, fecha_fin, motivo, profesional_id
               FROM bloqueos_horarios
               WHERE fecha_inicio < ? AND fecha_fin > ?
               AND (profesional_id IS NULL OR profesional_id = ? OR ? IS NULL)`;
  const params = [fechaFin, fechaInicio, profesionalId ?? null, profesionalId ?? null];
  if (conn) {
    const [rows] = await conn.execute<(BloqueoRow & RowDataPacket)[]>(sql, params);
    return rows;
  }
  return executeTenantQuery<(BloqueoRow & RowDataPacket)[]>(sql, params);
}

export interface BloqueoListFilters {
  from?: Date;
  to?: Date;
  profesionalId?: number | null;
}

export async function list(filters: BloqueoListFilters = {}): Promise<BloqueoRow[]> {
  let sql = `SELECT id, fecha_inicio, fecha_fin, motivo, profesional_id FROM bloqueos_horarios WHERE 1=1`;
  const params: unknown[] = [];

  if (filters.from) {
    sql += ` AND fecha_fin >= ?`;
    params.push(filters.from);
  }
  if (filters.to) {
    sql += ` AND fecha_inicio <= ?`;
    params.push(filters.to);
  }
  if (filters.profesionalId != null) {
    sql += ` AND (profesional_id IS NULL OR profesional_id = ?)`;
    params.push(filters.profesionalId);
  }

  sql += ` ORDER BY fecha_inicio ASC`;
  return executeTenantQuery<(BloqueoRow & RowDataPacket)[]>(sql, params);
}

export async function create(
  data: {
    fechaInicio: Date;
    fechaFin: Date;
    motivo?: string | null;
    profesionalId?: number | null;
  },
  conn?: PoolConnection
): Promise<number> {
  const sql = `INSERT INTO bloqueos_horarios (fecha_inicio, fecha_fin, motivo, profesional_id)
               VALUES (?, ?, ?, ?)`;
  const params = [data.fechaInicio, data.fechaFin, data.motivo ?? null, data.profesionalId ?? null];
  if (conn) {
    const [result] = await conn.execute<ResultSetHeader>(sql, params);
    return result.insertId;
  }
  const result = await executeTenantMutation(sql, params);
  return result.insertId;
}

export async function deleteById(id: number): Promise<void> {
  await executeTenantMutation(`DELETE FROM bloqueos_horarios WHERE id = ?`, [id]);
}
