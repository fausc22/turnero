import { db } from '../config/database';
import { Producto } from '../types';

class ProductoRepository {
  async findAll(barberiaId: number, activosOnly = false): Promise<Producto[]> {
    if (activosOnly) {
      const [rows] = await db.execute(
        'SELECT * FROM productos WHERE barberia_id = ? AND activo = TRUE ORDER BY nombre',
        [barberiaId]
      );
      return rows as Producto[];
    }

    const [rows] = await db.execute(
      'SELECT * FROM productos WHERE barberia_id = ? ORDER BY nombre',
      [barberiaId]
    );
    return rows as Producto[];
  }

  async findById(id: number, barberiaId: number): Promise<Producto | null> {
    const [rows] = await db.execute(
      'SELECT * FROM productos WHERE id = ? AND barberia_id = ?',
      [id, barberiaId]
    );
    const result = rows as Producto[];
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Producto, 'id'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO productos (barberia_id, nombre, precio, stock_actual, activo) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.barberia_id, data.nombre, data.precio, data.stock_actual, data.activo]
    );

    return (result as any).insertId;
  }

  async update(
    id: number,
    barberiaId: number,
    data: Partial<Omit<Producto, 'id' | 'barberia_id'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.precio !== undefined) {
      fields.push('precio = ?');
      values.push(data.precio);
    }
    if (data.stock_actual !== undefined) {
      fields.push('stock_actual = ?');
      values.push(data.stock_actual);
    }
    if (data.activo !== undefined) {
      fields.push('activo = ?');
      values.push(data.activo);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id, barberiaId);
    await db.execute(
      `UPDATE productos SET ${fields.join(', ')} WHERE id = ? AND barberia_id = ?`,
      values
    );
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    await db.execute('DELETE FROM productos WHERE id = ? AND barberia_id = ?', [id, barberiaId]);
  }
}

export const productoRepository = new ProductoRepository();

