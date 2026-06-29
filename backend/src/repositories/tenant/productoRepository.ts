import { RowDataPacket, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface ProductoRow {
  id: number;
  nombre: string;
  precio: number;
  stock_actual: number;
  activo: number;
  orden: number;
}

export async function listActivosConStock(): Promise<ProductoRow[]> {
  return executeTenantQuery<(ProductoRow & RowDataPacket)[]>(
    `SELECT id, nombre, precio, stock_actual, activo, orden
     FROM productos WHERE activo = 1 AND stock_actual > 0
     ORDER BY orden, nombre`
  );
}

export async function findById(id: number, conn?: PoolConnection): Promise<ProductoRow | null> {
  const sql = `SELECT id, nombre, precio, stock_actual, activo, orden FROM productos WHERE id = ? AND activo = 1`;
  if (conn) {
    const [rows] = await conn.execute<(ProductoRow & RowDataPacket)[]>(sql, [id]);
    return rows[0] ?? null;
  }
  const rows = await executeTenantQuery<(ProductoRow & RowDataPacket)[]>(sql, [id]);
  return rows[0] ?? null;
}

export async function decrementStock(
  id: number,
  cantidad: number,
  conn: PoolConnection
): Promise<void> {
  const [result] = await conn.execute<ResultSetHeader>(
    `UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ? AND stock_actual >= ?`,
    [cantidad, id, cantidad]
  );
  if (result.affectedRows === 0) {
    throw new Error('STOCK_INSUFICIENTE');
  }
}

export async function incrementStock(
  id: number,
  cantidad: number,
  conn: PoolConnection
): Promise<void> {
  await conn.execute(`UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?`, [
    cantidad,
    id,
  ]);
}

export async function listAll(): Promise<ProductoRow[]> {
  return executeTenantQuery<(ProductoRow & RowDataPacket)[]>(
    `SELECT id, nombre, precio, stock_actual, activo, orden FROM productos ORDER BY orden, nombre`
  );
}

export async function create(data: {
  nombre: string;
  precio: number;
  stockActual?: number;
  orden?: number;
}): Promise<number> {
  const result = await executeTenantMutation(
    `INSERT INTO productos (nombre, precio, stock_actual, orden) VALUES (?, ?, ?, ?)`,
    [data.nombre, data.precio, data.stockActual ?? 0, data.orden ?? 0]
  );
  return result.insertId;
}

export async function update(
  id: number,
  data: {
    nombre?: string;
    precio?: number;
    stockActual?: number;
    orden?: number;
    activo?: number;
  }
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.precio !== undefined) {
    fields.push('precio = ?');
    params.push(data.precio);
  }
  if (data.stockActual !== undefined) {
    fields.push('stock_actual = ?');
    params.push(data.stockActual);
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
  await executeTenantMutation(`UPDATE productos SET ${fields.join(', ')} WHERE id = ?`, params);
}
