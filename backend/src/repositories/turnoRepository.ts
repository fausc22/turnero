import { db } from '../config/database';
import { Turno, EstadoTurno } from '../types';

class TurnoRepository {
  async findAll(barberiaId: number, filters?: { estado?: EstadoTurno; fechaDesde?: Date; fechaHasta?: Date }): Promise<Turno[]> {
    let query = 'SELECT * FROM turnos WHERE barberia_id = ?';
    const params: any[] = [barberiaId];

    if (filters?.estado) {
      query += ' AND estado = ?';
      params.push(filters.estado);
    }

    if (filters?.fechaDesde) {
      query += ' AND fecha_inicio >= ?';
      params.push(filters.fechaDesde);
    }

    if (filters?.fechaHasta) {
      query += ' AND fecha_inicio <= ?';
      params.push(filters.fechaHasta);
    }

    query += ' ORDER BY fecha_inicio DESC';

    const [rows] = await db.execute(query, params);
    return rows as Turno[];
  }

  async findById(id: number, barberiaId: number): Promise<Turno | null> {
    const [rows] = await db.execute(
      'SELECT * FROM turnos WHERE id = ? AND barberia_id = ?',
      [id, barberiaId]
    );
    const result = rows as Turno[];
    return result.length > 0 ? result[0] : null;
  }

  async findByCliente(clienteId: number, barberiaId: number): Promise<Turno[]> {
    const [rows] = await db.execute(
      'SELECT * FROM turnos WHERE cliente_id = ? AND barberia_id = ? ORDER BY fecha_inicio DESC',
      [clienteId, barberiaId]
    );
    return rows as Turno[];
  }

  async checkOverlap(
    barberiaId: number,
    fechaInicio: Date,
    fechaFin: Date,
    excludeTurnoId?: number
  ): Promise<Turno[]> {
    let query = `
      SELECT * FROM turnos 
      WHERE barberia_id = ? 
      AND estado IN ('PENDIENTE', 'CONFIRMADO')
      AND (
        (fecha_inicio <= ? AND fecha_fin > ?) OR
        (fecha_inicio < ? AND fecha_fin >= ?) OR
        (fecha_inicio >= ? AND fecha_fin <= ?)
      )
    `;
    const params: any[] = [barberiaId, fechaInicio, fechaInicio, fechaFin, fechaFin, fechaInicio, fechaFin];

    if (excludeTurnoId) {
      query += ' AND id != ?';
      params.push(excludeTurnoId);
    }

    const [rows] = await db.execute(query, params);
    return rows as Turno[];
  }

  async create(data: Omit<Turno, 'id' | 'creado_en'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO turnos 
       (barberia_id, cliente_id, fecha_inicio, fecha_fin, estado, precio_total) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.barberia_id,
        data.cliente_id,
        data.fecha_inicio,
        data.fecha_fin,
        data.estado,
        data.precio_total
      ]
    );

    return (result as any).insertId;
  }

  async update(
    id: number,
    barberiaId: number,
    data: Partial<Omit<Turno, 'id' | 'barberia_id' | 'creado_en'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.cliente_id !== undefined) {
      fields.push('cliente_id = ?');
      values.push(data.cliente_id);
    }
    if (data.fecha_inicio !== undefined) {
      fields.push('fecha_inicio = ?');
      values.push(data.fecha_inicio);
    }
    if (data.fecha_fin !== undefined) {
      fields.push('fecha_fin = ?');
      values.push(data.fecha_fin);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      values.push(data.estado);
    }
    if (data.precio_total !== undefined) {
      fields.push('precio_total = ?');
      values.push(data.precio_total);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id, barberiaId);
    await db.execute(
      `UPDATE turnos SET ${fields.join(', ')} WHERE id = ? AND barberia_id = ?`,
      values
    );
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    await db.execute('DELETE FROM turnos WHERE id = ? AND barberia_id = ?', [id, barberiaId]);
  }
}

export const turnoRepository = new TurnoRepository();

