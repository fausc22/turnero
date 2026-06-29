import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface ListaEsperaRow {
  id: number;
  cliente_id: number;
  servicio_ids: number[];
  fecha_desde: Date;
  fecha_hasta: Date;
  notificado: number;
  creado_en: Date;
  cliente_nombre?: string;
  cliente_telefono?: string | null;
  cliente_email?: string | null;
}

function parseRow(row: ListaEsperaRow & RowDataPacket): ListaEsperaRow {
  if (typeof row.servicio_ids === 'string') {
    row.servicio_ids = JSON.parse(row.servicio_ids);
  }
  return row;
}

export async function create(
  data: {
    clienteId: number;
    servicioIds: number[];
    fechaDesde: string;
    fechaHasta: string;
  },
  conn?: PoolConnection
): Promise<number> {
  const sql = `INSERT INTO lista_espera (cliente_id, servicio_ids, fecha_desde, fecha_hasta)
               VALUES (?, ?, ?, ?)`;
  const params = [
    data.clienteId,
    JSON.stringify(data.servicioIds),
    data.fechaDesde,
    data.fechaHasta,
  ];
  if (conn) {
    const [result] = await conn.execute(sql, params);
    return (result as { insertId: number }).insertId;
  }
  const result = await executeTenantMutation(sql, params);
  return result.insertId;
}

export async function findPendingForSlot(
  servicioIds: number[],
  fecha: Date
): Promise<ListaEsperaRow[]> {
  const fechaStr = fecha.toISOString().slice(0, 10);
  const rows = await executeTenantQuery<(ListaEsperaRow & RowDataPacket)[]>(
    `SELECT le.id, le.cliente_id, le.servicio_ids, le.fecha_desde, le.fecha_hasta, le.notificado, le.creado_en,
            c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
     FROM lista_espera le
     JOIN clientes c ON c.id = le.cliente_id
     WHERE le.notificado = 0
       AND le.fecha_desde <= ?
       AND le.fecha_hasta >= ?
     ORDER BY le.creado_en ASC`,
    [fechaStr, fechaStr]
  );

  return rows
    .map(parseRow)
    .filter((row) => servicioIds.every((sid) => row.servicio_ids.includes(sid)));
}

export async function markNotified(id: number, conn?: PoolConnection): Promise<void> {
  const sql = `UPDATE lista_espera SET notificado = 1 WHERE id = ?`;
  if (conn) {
    await conn.execute(sql, [id]);
    return;
  }
  await executeTenantMutation(sql, [id]);
}

export async function listAll(): Promise<ListaEsperaRow[]> {
  const rows = await executeTenantQuery<(ListaEsperaRow & RowDataPacket)[]>(
    `SELECT le.id, le.cliente_id, le.servicio_ids, le.fecha_desde, le.fecha_hasta, le.notificado, le.creado_en,
            c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
     FROM lista_espera le
     JOIN clientes c ON c.id = le.cliente_id
     ORDER BY le.creado_en DESC`
  );
  return rows.map(parseRow);
}

export async function findById(id: number): Promise<ListaEsperaRow | null> {
  const rows = await executeTenantQuery<(ListaEsperaRow & RowDataPacket)[]>(
    `SELECT le.id, le.cliente_id, le.servicio_ids, le.fecha_desde, le.fecha_hasta, le.notificado, le.creado_en,
            c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
     FROM lista_espera le
     JOIN clientes c ON c.id = le.cliente_id
     WHERE le.id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  return row ? parseRow(row) : null;
}

export async function remove(id: number): Promise<void> {
  await executeTenantMutation(`DELETE FROM lista_espera WHERE id = ?`, [id]);
}

export async function findDuplicate(
  clienteId: number,
  servicioIds: number[],
  fechaDesde: string,
  fechaHasta: string
): Promise<ListaEsperaRow | null> {
  const rows = await executeTenantQuery<(ListaEsperaRow & RowDataPacket)[]>(
    `SELECT id, cliente_id, servicio_ids, fecha_desde, fecha_hasta, notificado, creado_en
     FROM lista_espera
     WHERE cliente_id = ? AND fecha_desde = ? AND fecha_hasta = ?`,
    [clienteId, fechaDesde, fechaHasta]
  );
  const sorted = [...servicioIds].sort((a, b) => a - b);
  for (const row of rows.map(parseRow)) {
    const existing = [...row.servicio_ids].sort((a, b) => a - b);
    if (existing.length === sorted.length && existing.every((v, i) => v === sorted[i])) {
      return row;
    }
  }
  return null;
}
