import { db } from '../config/database';
import { Barberia } from '../types';

class BarberiaRepository {
  async findAll(): Promise<Barberia[]> {
    const [rows] = await db.execute('SELECT * FROM barberias ORDER BY creada_en DESC');
    return rows as Barberia[];
  }

  async findById(id: number): Promise<Barberia | null> {
    const [rows] = await db.execute('SELECT * FROM barberias WHERE id = ?', [id]);
    const result = rows as Barberia[];
    return result.length > 0 ? result[0] : null;
  }

  async findBySlug(slug: string): Promise<Barberia | null> {
    const [rows] = await db.execute('SELECT * FROM barberias WHERE slug = ?', [slug]);
    const result = rows as Barberia[];
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Barberia, 'id' | 'creada_en'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO barberias (nombre, slug, email, telefono, activa) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.nombre, data.slug, data.email, data.telefono, data.activa]
    );

    return (result as any).insertId;
  }

  async update(id: number, data: Partial<Omit<Barberia, 'id' | 'creada_en'>>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.slug !== undefined) {
      fields.push('slug = ?');
      values.push(data.slug);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.telefono !== undefined) {
      fields.push('telefono = ?');
      values.push(data.telefono);
    }
    if (data.activa !== undefined) {
      fields.push('activa = ?');
      values.push(data.activa);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);
    await db.execute(
      `UPDATE barberias SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await db.execute('DELETE FROM barberias WHERE id = ?', [id]);
  }
}

export const barberiaRepository = new BarberiaRepository();

