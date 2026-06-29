import { RowDataPacket, PoolConnection } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface ServicioRow {
  id: number;
  categoria_id: number | null;
  nombre: string;
  descripcion: string | null;
  duracion_minutos: number;
  precio: number;
  activo: number;
  orden: number;
  categoria_nombre?: string | null;
}

export async function listActivos(): Promise<ServicioRow[]> {
  return executeTenantQuery<(ServicioRow & RowDataPacket)[]>(
    `SELECT s.id, s.categoria_id, s.nombre, s.descripcion, s.duracion_minutos, s.precio, s.activo, s.orden,
            c.nombre AS categoria_nombre
     FROM servicios s
     LEFT JOIN categorias_servicio c ON c.id = s.categoria_id
     WHERE s.activo = 1
     ORDER BY s.orden, s.nombre`
  );
}

export async function findByIds(ids: number[], conn?: PoolConnection): Promise<ServicioRow[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  const sql = `SELECT id, categoria_id, nombre, descripcion, duracion_minutos, precio, activo, orden
               FROM servicios WHERE id IN (${placeholders}) AND activo = 1`;
  if (conn) {
    const [rows] = await conn.execute<(ServicioRow & RowDataPacket)[]>(sql, ids);
    return rows;
  }
  return executeTenantQuery<(ServicioRow & RowDataPacket)[]>(sql, ids);
}

export async function listAll(): Promise<ServicioRow[]> {
  return executeTenantQuery<(ServicioRow & RowDataPacket)[]>(
    `SELECT s.id, s.categoria_id, s.nombre, s.descripcion, s.duracion_minutos, s.precio, s.activo, s.orden,
            c.nombre AS categoria_nombre
     FROM servicios s
     LEFT JOIN categorias_servicio c ON c.id = s.categoria_id
     ORDER BY s.orden, s.nombre`
  );
}

export async function create(data: {
  categoriaId?: number | null;
  nombre: string;
  descripcion?: string | null;
  duracionMinutos: number;
  precio: number;
  orden?: number;
}): Promise<number> {
  const result = await executeTenantMutation(
    `INSERT INTO servicios (categoria_id, nombre, descripcion, duracion_minutos, precio, orden)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.categoriaId ?? null,
      data.nombre,
      data.descripcion ?? null,
      data.duracionMinutos,
      data.precio,
      data.orden ?? 0,
    ]
  );
  return result.insertId;
}

export async function update(
  id: number,
  data: {
    categoriaId?: number | null;
    nombre?: string;
    descripcion?: string | null;
    duracionMinutos?: number;
    precio?: number;
    orden?: number;
    activo?: number;
  }
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.categoriaId !== undefined) {
    fields.push('categoria_id = ?');
    params.push(data.categoriaId);
  }
  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.descripcion !== undefined) {
    fields.push('descripcion = ?');
    params.push(data.descripcion);
  }
  if (data.duracionMinutos !== undefined) {
    fields.push('duracion_minutos = ?');
    params.push(data.duracionMinutos);
  }
  if (data.precio !== undefined) {
    fields.push('precio = ?');
    params.push(data.precio);
  }
  if (data.orden !== undefined) {
    fields.push('orden = ?');
    params.push(data.orden);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    params.push(data.activo);
  }

  if (!fields.length) return;

  params.push(id);
  await executeTenantMutation(`UPDATE servicios SET ${fields.join(', ')} WHERE id = ?`, params);
}

export async function softDelete(id: number): Promise<void> {
  await executeTenantMutation(`UPDATE servicios SET activo = 0 WHERE id = ?`, [id]);
}
