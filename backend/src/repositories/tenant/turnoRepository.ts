import { RowDataPacket, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface TurnoRow {
  id: number;
  cliente_id: number;
  profesional_id: number | null;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: string;
  precio_total: number;
  notas_cliente: string | null;
  token_gestion: string | null;
  idempotency_key: string | null;
  reprogramaciones_count: number;
  creado_en: Date;
}

export interface TurnoServicioLine {
  servicio_id: number;
  nombre: string;
  precio_unitario: number;
}

export async function findByIdempotencyKey(
  key: string,
  conn?: PoolConnection
): Promise<TurnoRow | null> {
  const sql = `SELECT id, cliente_id, profesional_id, fecha_inicio, fecha_fin, estado, precio_total,
                      notas_cliente, token_gestion, idempotency_key, reprogramaciones_count, creado_en
               FROM turnos WHERE idempotency_key = ? LIMIT 1`;
  if (conn) {
    const [rows] = await conn.execute<(TurnoRow & RowDataPacket)[]>(sql, [key]);
    return rows[0] ?? null;
  }
  const rows = await executeTenantQuery<(TurnoRow & RowDataPacket)[]>(sql, [key]);
  return rows[0] ?? null;
}

export async function findByToken(token: string): Promise<TurnoRow | null> {
  const rows = await executeTenantQuery<(TurnoRow & RowDataPacket)[]>(
    `SELECT id, cliente_id, profesional_id, fecha_inicio, fecha_fin, estado, precio_total,
            notas_cliente, token_gestion, idempotency_key, reprogramaciones_count, creado_en
     FROM turnos WHERE token_gestion = ? LIMIT 1`,
    [token]
  );
  return rows[0] ?? null;
}

export async function findOverlappingForUpdate(
  fechaInicio: Date,
  fechaFin: Date,
  profesionalId: number | null,
  conn: PoolConnection,
  excludeTurnoId?: number
): Promise<TurnoRow[]> {
  let sql = `SELECT id, cliente_id, profesional_id, fecha_inicio, fecha_fin, estado, precio_total,
                    notas_cliente, token_gestion, idempotency_key, reprogramaciones_count, creado_en
             FROM turnos
             WHERE estado IN ('PENDIENTE', 'CONFIRMADO')
             AND fecha_inicio < ? AND fecha_fin > ?`;
  const params: unknown[] = [fechaFin, fechaInicio];

  if (profesionalId != null) {
    sql += ` AND (profesional_id IS NULL OR profesional_id = ?)`;
    params.push(profesionalId);
  }

  if (excludeTurnoId != null) {
    sql += ` AND id != ?`;
    params.push(excludeTurnoId);
  }

  sql += ` FOR UPDATE`;

  const [rows] = await conn.execute<(TurnoRow & RowDataPacket)[]>(sql, params);
  return rows;
}

export async function createTurno(
  data: {
    clienteId: number;
    profesionalId: number | null;
    fechaInicio: Date;
    fechaFin: Date;
    estado: string;
    precioTotal: number;
    notasCliente?: string | null;
    tokenGestion: string;
    idempotencyKey?: string | null;
  },
  conn: PoolConnection
): Promise<number> {
  const [result] = await conn.execute<ResultSetHeader>(
    `INSERT INTO turnos (cliente_id, profesional_id, fecha_inicio, fecha_fin, estado, precio_total,
                         notas_cliente, token_gestion, idempotency_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.clienteId,
      data.profesionalId,
      data.fechaInicio,
      data.fechaFin,
      data.estado,
      data.precioTotal,
      data.notasCliente ?? null,
      data.tokenGestion,
      data.idempotencyKey ?? null,
    ]
  );
  return result.insertId;
}

export async function addServicios(
  turnoId: number,
  lines: { servicioId: number; precio: number }[],
  conn: PoolConnection
): Promise<void> {
  for (const line of lines) {
    await conn.execute(
      `INSERT INTO turno_servicios (turno_id, servicio_id, precio_unitario) VALUES (?, ?, ?)`,
      [turnoId, line.servicioId, line.precio]
    );
  }
}

export async function addProductos(
  turnoId: number,
  lines: { productoId: number; cantidad: number; precio: number }[],
  conn: PoolConnection
): Promise<void> {
  for (const line of lines) {
    await conn.execute(
      `INSERT INTO turno_productos (turno_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
      [turnoId, line.productoId, line.cantidad, line.precio]
    );
  }
}

export async function getServicios(turnoId: number): Promise<TurnoServicioLine[]> {
  return executeTenantQuery<(TurnoServicioLine & RowDataPacket)[]>(
    `SELECT ts.servicio_id, s.nombre, ts.precio_unitario
     FROM turno_servicios ts JOIN servicios s ON s.id = ts.servicio_id
     WHERE ts.turno_id = ?`,
    [turnoId]
  );
}

export async function getProductos(
  turnoId: number
): Promise<{ producto_id: number; cantidad: number; precio_unitario: number }[]> {
  return executeTenantQuery<
    (RowDataPacket & { producto_id: number; cantidad: number; precio_unitario: number })[]
  >(`SELECT producto_id, cantidad, precio_unitario FROM turno_productos WHERE turno_id = ?`, [
    turnoId,
  ]);
}

export async function updateEstado(
  turnoId: number,
  estado: string,
  conn?: PoolConnection
): Promise<void> {
  const sql = `UPDATE turnos SET estado = ? WHERE id = ?`;
  if (conn) {
    await conn.execute(sql, [estado, turnoId]);
    return;
  }
  await executeTenantQuery(sql, [estado, turnoId]);
}

export async function updateFechas(
  turnoId: number,
  fechaInicio: Date,
  fechaFin: Date,
  profesionalId: number | null,
  conn: PoolConnection
): Promise<void> {
  await conn.execute(
    `UPDATE turnos SET fecha_inicio = ?, fecha_fin = ?, profesional_id = ?, reprogramaciones_count = reprogramaciones_count + 1 WHERE id = ?`,
    [fechaInicio, fechaFin, profesionalId, turnoId]
  );
}

export async function countTurnosMes(year: number, month: number): Promise<number> {
  const rows = await executeTenantQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(*) AS cnt FROM turnos
     WHERE YEAR(fecha_inicio) = ? AND MONTH(fecha_inicio) = ?
     AND estado NOT IN ('CANCELADO')`,
    [year, month]
  );
  return rows[0]?.cnt ?? 0;
}

export async function findTurnosEnRango(
  fechaInicio: Date,
  fechaFin: Date,
  profesionalId?: number | null
): Promise<TurnoRow[]> {
  let sql = `SELECT id, cliente_id, profesional_id, fecha_inicio, fecha_fin, estado, precio_total,
                    notas_cliente, token_gestion, idempotency_key, reprogramaciones_count, creado_en
             FROM turnos
             WHERE estado IN ('PENDIENTE', 'CONFIRMADO')
             AND fecha_inicio < ? AND fecha_fin > ?`;
  const params: unknown[] = [fechaFin, fechaInicio];
  if (profesionalId != null) {
    sql += ` AND (profesional_id IS NULL OR profesional_id = ?)`;
    params.push(profesionalId);
  }
  return executeTenantQuery<(TurnoRow & RowDataPacket)[]>(sql, params);
}

export async function expirePendingOlderThan(minutes: number): Promise<number> {
  const result = await executeTenantMutation(
    `UPDATE turnos SET estado = 'CANCELADO'
     WHERE estado = 'PENDIENTE' AND creado_en < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
    [minutes]
  );
  return result.affectedRows;
}

export interface TurnoListFilters {
  from?: Date;
  to?: Date;
  estado?: string;
  profesionalId?: number | null;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TurnoListRow extends TurnoRow {
  cliente_nombre: string;
  cliente_telefono: string | null;
  profesional_nombre: string | null;
}

export async function list(filters: TurnoListFilters = {}): Promise<TurnoListRow[]> {
  let sql = `SELECT t.id, t.cliente_id, t.profesional_id, t.fecha_inicio, t.fecha_fin, t.estado,
                    t.precio_total, t.notas_cliente, t.token_gestion, t.idempotency_key,
                    t.reprogramaciones_count, t.creado_en,
                    c.nombre AS cliente_nombre, c.telefono AS cliente_telefono,
                    p.nombre AS profesional_nombre
             FROM turnos t
             JOIN clientes c ON c.id = t.cliente_id
             LEFT JOIN profesionales p ON p.id = t.profesional_id
             WHERE 1=1`;
  const params: unknown[] = [];

  if (filters.from) {
    sql += ` AND t.fecha_inicio >= ?`;
    params.push(filters.from);
  }
  if (filters.to) {
    sql += ` AND t.fecha_inicio <= ?`;
    params.push(filters.to);
  }
  if (filters.estado) {
    sql += ` AND t.estado = ?`;
    params.push(filters.estado);
  }
  if (filters.profesionalId != null) {
    sql += ` AND t.profesional_id = ?`;
    params.push(filters.profesionalId);
  }
  if (filters.search) {
    sql += ` AND (c.nombre LIKE ? OR c.telefono LIKE ? OR c.telefono_normalizado LIKE ?)`;
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  sql += ` ORDER BY t.fecha_inicio DESC`;

  if (filters.limit != null) {
    sql += ` LIMIT ?`;
    params.push(filters.limit);
    if (filters.offset != null) {
      sql += ` OFFSET ?`;
      params.push(filters.offset);
    }
  }

  return executeTenantQuery<(TurnoListRow & RowDataPacket)[]>(sql, params);
}

export interface TurnoDetalleRow extends TurnoListRow {
  cliente_email: string | null;
}

export async function findById(id: number): Promise<TurnoDetalleRow | null> {
  const rows = await executeTenantQuery<(TurnoDetalleRow & RowDataPacket)[]>(
    `SELECT t.id, t.cliente_id, t.profesional_id, t.fecha_inicio, t.fecha_fin, t.estado,
            t.precio_total, t.notas_cliente, t.token_gestion, t.idempotency_key,
            t.reprogramaciones_count, t.creado_en,
            c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email,
            p.nombre AS profesional_nombre
     FROM turnos t
     JOIN clientes c ON c.id = t.cliente_id
     LEFT JOIN profesionales p ON p.id = t.profesional_id
     WHERE t.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateFechasPanel(
  turnoId: number,
  fechaInicio: Date,
  fechaFin: Date,
  profesionalId: number | null,
  conn?: PoolConnection
): Promise<void> {
  const sql = `UPDATE turnos SET fecha_inicio = ?, fecha_fin = ?, profesional_id = ?,
               reprogramaciones_count = reprogramaciones_count + 1 WHERE id = ?`;
  const params = [fechaInicio, fechaFin, profesionalId, turnoId];
  if (conn) {
    await conn.execute(sql, params);
    return;
  }
  await executeTenantQuery(sql, params);
}

export async function findConfirmedInRange(from: Date, to: Date): Promise<{ id: number }[]> {
  return executeTenantQuery<(RowDataPacket & { id: number })[]>(
    `SELECT id FROM turnos
     WHERE estado = 'CONFIRMADO' AND fecha_inicio >= ? AND fecha_inicio <= ?`,
    [from, to]
  );
}

export async function countByEstado(
  filters: { from?: Date; to?: Date; profesionalId?: number | null } = {}
): Promise<Record<string, number>> {
  let sql = `SELECT estado, COUNT(*) AS cnt FROM turnos WHERE 1=1`;
  const params: unknown[] = [];

  if (filters.from) {
    sql += ` AND fecha_inicio >= ?`;
    params.push(filters.from);
  }
  if (filters.to) {
    sql += ` AND fecha_inicio <= ?`;
    params.push(filters.to);
  }
  if (filters.profesionalId != null) {
    sql += ` AND profesional_id = ?`;
    params.push(filters.profesionalId);
  }

  sql += ` GROUP BY estado`;

  const rows = await executeTenantQuery<(RowDataPacket & { estado: string; cnt: number })[]>(
    sql,
    params
  );
  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.estado] = row.cnt;
  }
  return result;
}
