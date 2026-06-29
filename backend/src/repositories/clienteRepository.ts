import { db } from '../config/database';
import { Cliente } from '../types';

class ClienteRepository {
  async findAll(barberiaId: number): Promise<Cliente[]> {
    const [rows] = await db.execute(
      'SELECT * FROM clientes WHERE barberia_id = ? ORDER BY creado_en DESC',
      [barberiaId]
    );
    return rows as Cliente[];
  }

  async findById(id: number, barberiaId: number): Promise<Cliente | null> {
    const [rows] = await db.execute(
      'SELECT * FROM clientes WHERE id = ? AND barberia_id = ?',
      [id, barberiaId]
    );
    const result = rows as Cliente[];
    return result.length > 0 ? result[0] : null;
  }

  async findByEmail(email: string, barberiaId: number): Promise<Cliente | null> {
    const [rows] = await db.execute(
      'SELECT * FROM clientes WHERE email = ? AND barberia_id = ?',
      [email, barberiaId]
    );
    const result = rows as Cliente[];
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Cliente, 'id' | 'creado_en'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO clientes (barberia_id, nombre, email, telefono) 
       VALUES (?, ?, ?, ?)`,
      [data.barberia_id, data.nombre, data.email, data.telefono]
    );

    return (result as any).insertId;
  }

  async update(
    id: number,
    barberiaId: number,
    data: Partial<Omit<Cliente, 'id' | 'barberia_id' | 'creado_en'>>
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.telefono !== undefined) {
      fields.push('telefono = ?');
      values.push(data.telefono);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id, barberiaId);
    await db.execute(
      `UPDATE clientes SET ${fields.join(', ')} WHERE id = ? AND barberia_id = ?`,
      values
    );
  }

  async delete(id: number, barberiaId: number): Promise<void> {
    await db.execute('DELETE FROM clientes WHERE id = ? AND barberia_id = ?', [id, barberiaId]);
  }
}

export const clienteRepository = new ClienteRepository();

