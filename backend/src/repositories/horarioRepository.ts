import { db } from '../config/database';
import { HorarioBarberia, BloqueoHorario } from '../types';

class HorarioRepository {
  async findHorariosByBarberia(barberiaId: number): Promise<HorarioBarberia[]> {
    const [rows] = await db.execute(
      'SELECT * FROM horarios_barberia WHERE barberia_id = ? ORDER BY dia_semana',
      [barberiaId]
    );
    return rows as HorarioBarberia[];
  }

  async createHorario(data: Omit<HorarioBarberia, 'id'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO horarios_barberia (barberia_id, dia_semana, hora_inicio, hora_fin) 
       VALUES (?, ?, ?, ?)`,
      [data.barberia_id, data.dia_semana, data.hora_inicio, data.hora_fin]
    );

    return (result as any).insertId;
  }

  async updateHorario(
    id: number,
    barberiaId: number,
    data: Partial<Omit<HorarioBarberia, 'id' | 'barberia_id'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.dia_semana !== undefined) {
      fields.push('dia_semana = ?');
      values.push(data.dia_semana);
    }
    if (data.hora_inicio !== undefined) {
      fields.push('hora_inicio = ?');
      values.push(data.hora_inicio);
    }
    if (data.hora_fin !== undefined) {
      fields.push('hora_fin = ?');
      values.push(data.hora_fin);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id, barberiaId);
    await db.execute(
      `UPDATE horarios_barberia SET ${fields.join(', ')} WHERE id = ? AND barberia_id = ?`,
      values
    );
  }

  async deleteHorario(id: number, barberiaId: number): Promise<void> {
    await db.execute(
      'DELETE FROM horarios_barberia WHERE id = ? AND barberia_id = ?',
      [id, barberiaId]
    );
  }

  async findBloqueosByBarberia(
    barberiaId: number,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): Promise<BloqueoHorario[]> {
    let query = 'SELECT * FROM bloqueos_horarios WHERE barberia_id = ?';
    const params: any[] = [barberiaId];

    if (fechaDesde) {
      query += ' AND fecha_fin >= ?';
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      query += ' AND fecha_inicio <= ?';
      params.push(fechaHasta);
    }

    query += ' ORDER BY fecha_inicio';

    const [rows] = await db.execute(query, params);
    return rows as BloqueoHorario[];
  }

  async createBloqueo(data: Omit<BloqueoHorario, 'id'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO bloqueos_horarios (barberia_id, fecha_inicio, fecha_fin, motivo) 
       VALUES (?, ?, ?, ?)`,
      [data.barberia_id, data.fecha_inicio, data.fecha_fin, data.motivo]
    );

    return (result as any).insertId;
  }

  async deleteBloqueo(id: number, barberiaId: number): Promise<void> {
    await db.execute(
      'DELETE FROM bloqueos_horarios WHERE id = ? AND barberia_id = ?',
      [id, barberiaId]
    );
  }
}

export const horarioRepository = new HorarioRepository();

