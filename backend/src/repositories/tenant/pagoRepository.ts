import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { executeTenantMutation, executeTenantQuery } from '../../config/tenantDatabase';

export interface PagoRow {
  id: number;
  turno_id: number | null;
  monto: number;
  estado: string;
  proveedor: string;
  referencia_externa: string | null;
  idempotency_key: string | null;
  creado_en: Date;
}

export interface PagoListRow extends PagoRow {
  cliente_nombre: string | null;
}

export async function findByIdempotencyKey(
  key: string,
  conn?: PoolConnection
): Promise<PagoRow | null> {
  const sql = `SELECT id, turno_id, monto, estado, proveedor, referencia_externa, idempotency_key, creado_en
               FROM pagos WHERE idempotency_key = ? LIMIT 1`;
  if (conn) {
    const [rows] = await conn.execute<(PagoRow & RowDataPacket)[]>(sql, [key]);
    return rows[0] ?? null;
  }
  const rows = await executeTenantQuery<(PagoRow & RowDataPacket)[]>(sql, [key]);
  return rows[0] ?? null;
}

export async function insertIfNotExists(
  input: {
    turnoId: number;
    monto: number;
    estado: string;
    referenciaExterna: string;
    idempotencyKey: string;
  },
  conn?: PoolConnection
): Promise<{ inserted: boolean; id?: number }> {
  const existing = await findByIdempotencyKey(input.idempotencyKey, conn);
  if (existing) return { inserted: false, id: existing.id };

  const sql = `INSERT INTO pagos (turno_id, monto, estado, proveedor, referencia_externa, idempotency_key)
               VALUES (?, ?, ?, 'MERCADO_PAGO', ?, ?)`;
  const params = [
    input.turnoId,
    input.monto,
    input.estado,
    input.referenciaExterna,
    input.idempotencyKey,
  ];

  if (conn) {
    const [result] = await conn.execute(sql, params);
    return { inserted: true, id: (result as { insertId: number }).insertId };
  }

  const result = await executeTenantMutation(sql, params);
  return { inserted: true, id: result.insertId };
}

export async function list(filters: {
  from?: Date;
  to?: Date;
  estado?: string;
  limit?: number;
}): Promise<PagoListRow[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.from) {
    conditions.push('p.creado_en >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push('p.creado_en <= ?');
    params.push(filters.to);
  }
  if (filters.estado) {
    conditions.push('p.estado = ?');
    params.push(filters.estado);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);

  return executeTenantQuery<(PagoListRow & RowDataPacket)[]>(
    `SELECT p.id, p.turno_id, p.monto, p.estado, p.proveedor, p.referencia_externa,
            p.idempotency_key, p.creado_en, c.nombre AS cliente_nombre
     FROM pagos p
     LEFT JOIN turnos t ON t.id = p.turno_id
     LEFT JOIN clientes c ON c.id = t.cliente_id
     ${where}
     ORDER BY p.creado_en DESC
     LIMIT ${limit}`,
    params
  );
}
