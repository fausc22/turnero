import { db } from '../config/database';
import { Servicio } from '../types';

class ServicioRepository {
  async findAll(barberiaId: number, activosOnly = false): Promise<Servicio[]> {
    if (activosOnly) {
      const [rows] = await db.execute(
        'SELECT * FROM servicios WHERE barberia_id = ? AND activo = TRUE ORDER BY nombre',
        [barberiaId]
      );
      return rows as Servicio[];
    }

    const [rows] = await db.execute(
      'SELECT * FROM servicios WHERE barberia_id = ? ORDER BY nombre',
      [barberiaId]
    );
    return rows as Servicio[];
  }

  async findById(id: number, barberiaId: number): Promise<Servicio | null> {
    const [rows] = await db.execute(
      'SELECT * FROM servicios WHERE id = ? AND barberia_id = ?',
      [id, barberiaId]
    );
    const result = rows as Servicio[];
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Servicio, 'id'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO servicios (barberia_id, nombre, duracion_minutos, precio, activo) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.barberia_id, data.nombre, data.duracion_minutos, data.precio, data.activo]
    );

    return (result as any).insertId;
  }

  async update(
    id: number,
    barberiaId: number,
    data: Partial<Omit<Servicio, 'id' | 'barberia_id'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.duracion_minutos !== undefined) {
      fields.push('duracion_minutos = ?');
      values.push(data.duracion_minutos);
    }
    if (data.precio !== undefined) {
      fields.push('precio = ?');
      values.push(data.precio);
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
      `UPDATE servicios SET ${fields.join(', ')} WHERE id = ? AND barberia_id = ?`,
      values
    );
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    await db.execute('DELETE FROM servicios WHERE id = ? AND barberia_id = ?', [id, barberiaId]);
  }
}

export const servicioRepository = new ServicioRepository();

