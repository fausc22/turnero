import { RowDataPacket, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface ClienteRow {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  telefono_normalizado: string | null;
}

export interface ClienteFullRow extends ClienteRow {
  notas_internas: string | null;
  tags: unknown;
  creado_en: Date;
}

export interface ClienteListFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function findByTelefonoNormalizado(
  telefonoNormalizado: string,
  conn?: PoolConnection
): Promise<ClienteRow | null> {
  const sql = `SELECT id, nombre, email, telefono, telefono_normalizado
               FROM clientes WHERE telefono_normalizado = ? LIMIT 1`;
  if (conn) {
    const [rows] = await conn.execute<(ClienteRow & RowDataPacket)[]>(sql, [telefonoNormalizado]);
    return rows[0] ?? null;
  }
  const rows = await executeTenantQuery<(ClienteRow & RowDataPacket)[]>(sql, [telefonoNormalizado]);
  return rows[0] ?? null;
}

export async function upsertByTelefono(
  data: { nombre: string; telefono: string; telefonoNormalizado: string; email?: string | null },
  conn: PoolConnection
): Promise<number> {
  const existing = await findByTelefonoNormalizado(data.telefonoNormalizado, conn);
  if (existing) {
    if (existing.nombre !== data.nombre) {
      await conn.execute(`UPDATE clientes SET nombre = ? WHERE id = ?`, [data.nombre, existing.id]);
    }
    if (data.email && data.email !== existing.email) {
      await conn.execute(`UPDATE clientes SET email = ? WHERE id = ?`, [data.email, existing.id]);
    }
    return existing.id;
  }
  const [result] = await conn.execute<ResultSetHeader>(
    `INSERT INTO clientes (nombre, email, telefono, telefono_normalizado) VALUES (?, ?, ?, ?)`,
    [data.nombre, data.email ?? null, data.telefono, data.telefonoNormalizado]
  );
  return result.insertId;
}

export async function list(filters: ClienteListFilters = {}): Promise<ClienteFullRow[]> {
  let sql = `SELECT id, nombre, email, telefono, telefono_normalizado, notas_internas, tags, creado_en
             FROM clientes WHERE 1=1`;
  const params: unknown[] = [];

  if (filters.search) {
    sql += ` AND (nombre LIKE ? OR telefono LIKE ? OR telefono_normalizado LIKE ? OR email LIKE ?)`;
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  sql += ` ORDER BY nombre ASC`;

  if (filters.limit != null) {
    sql += ` LIMIT ?`;
    params.push(filters.limit);
    if (filters.offset != null) {
      sql += ` OFFSET ?`;
      params.push(filters.offset);
    }
  }

  return executeTenantQuery<(ClienteFullRow & RowDataPacket)[]>(sql, params);
}

export async function findById(id: number): Promise<ClienteFullRow | null> {
  const rows = await executeTenantQuery<(ClienteFullRow & RowDataPacket)[]>(
    `SELECT id, nombre, email, telefono, telefono_normalizado, notas_internas, tags, creado_en
     FROM clientes WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create(
  data: {
    nombre: string;
    telefono?: string | null;
    telefonoNormalizado?: string | null;
    email?: string | null;
    notasInternas?: string | null;
    tags?: unknown;
  },
  conn?: PoolConnection
): Promise<number> {
  const sql = `INSERT INTO clientes (nombre, email, telefono, telefono_normalizado, notas_internas, tags)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [
    data.nombre,
    data.email ?? null,
    data.telefono ?? null,
    data.telefonoNormalizado ?? null,
    data.notasInternas ?? null,
    data.tags != null ? JSON.stringify(data.tags) : null,
  ];
  if (conn) {
    const [result] = await conn.execute<ResultSetHeader>(sql, params);
    return result.insertId;
  }
  const result = await executeTenantMutation(sql, params);
  return result.insertId;
}

export async function update(
  id: number,
  data: {
    nombre?: string;
    telefono?: string | null;
    telefonoNormalizado?: string | null;
    email?: string | null;
    notasInternas?: string | null;
    tags?: unknown;
  }
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    params.push(data.email);
  }
  if (data.telefono !== undefined) {
    fields.push('telefono = ?');
    params.push(data.telefono);
  }
  if (data.telefonoNormalizado !== undefined) {
    fields.push('telefono_normalizado = ?');
    params.push(data.telefonoNormalizado);
  }
  if (data.notasInternas !== undefined) {
    fields.push('notas_internas = ?');
    params.push(data.notasInternas);
  }
  if (data.tags !== undefined) {
    fields.push('tags = ?');
    params.push(data.tags != null ? JSON.stringify(data.tags) : null);
  }

  if (!fields.length) return;

  params.push(id);
  await executeTenantQuery(`UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`, params);
}

export interface ClienteHistorialTurnoRow {
  id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: string;
  precio_total: number;
  profesional_nombre: string | null;
  servicios: string;
}

export async function getClienteResumen(
  clienteId: number
): Promise<{ totalGastado: number; ultimaVisita: string | null }> {
  const rows = await executeTenantQuery<
    (RowDataPacket & { total_gastado: number; ultima_visita: Date | null })[]
  >(
    `SELECT COALESCE(SUM(CASE WHEN estado IN ('COMPLETADO','CONFIRMADO') THEN precio_total ELSE 0 END), 0) AS total_gastado,
            MAX(CASE WHEN estado = 'COMPLETADO' THEN fecha_inicio END) AS ultima_visita
     FROM turnos WHERE cliente_id = ?`,
    [clienteId]
  );
  const row = rows[0];
  return {
    totalGastado: Number(row?.total_gastado ?? 0),
    ultimaVisita: row?.ultima_visita ? new Date(row.ultima_visita).toISOString() : null,
  };
}

export async function getHistorialTurnos(clienteId: number): Promise<ClienteHistorialTurnoRow[]> {
  return executeTenantQuery<(ClienteHistorialTurnoRow & RowDataPacket)[]>(
    `SELECT t.id, t.fecha_inicio, t.fecha_fin, t.estado, t.precio_total,
            p.nombre AS profesional_nombre,
            GROUP_CONCAT(s.nombre ORDER BY s.nombre SEPARATOR ', ') AS servicios
     FROM turnos t
     LEFT JOIN profesionales p ON p.id = t.profesional_id
     LEFT JOIN turno_servicios ts ON ts.turno_id = t.id
     LEFT JOIN servicios s ON s.id = ts.servicio_id
     WHERE t.cliente_id = ?
     GROUP BY t.id
     ORDER BY t.fecha_inicio DESC`,
    [clienteId]
  );
}
