import { RowDataPacket } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface CategoriaRow {
  id: number;
  nombre: string;
  orden: number;
  activo: number;
}

export async function listAll(): Promise<CategoriaRow[]> {
  return executeTenantQuery<(CategoriaRow & RowDataPacket)[]>(
    `SELECT id, nombre, orden, activo FROM categorias_servicio ORDER BY orden, nombre`
  );
}

export async function findById(id: number): Promise<CategoriaRow | null> {
  const rows = await executeTenantQuery<(CategoriaRow & RowDataPacket)[]>(
    `SELECT id, nombre, orden, activo FROM categorias_servicio WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create(data: {
  nombre: string;
  orden?: number;
}): Promise<number> {
  const result = await executeTenantMutation(
    `INSERT INTO categorias_servicio (nombre, orden, activo) VALUES (?, ?, 1)`,
    [data.nombre, data.orden ?? 0]
  );
  return result.insertId;
}

export async function update(
  id: number,
  data: { nombre?: string; orden?: number; activo?: number }
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];
  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
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
  await executeTenantMutation(`UPDATE categorias_servicio SET ${fields.join(', ')} WHERE id = ?`, params);
}
