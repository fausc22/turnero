import { db } from '../config/database';
import { Usuario } from '../types';

class UsuarioRepository {
  async findAll(barberiaId?: number): Promise<Usuario[]> {
    if (barberiaId) {
      const [rows] = await db.execute(
        'SELECT * FROM usuarios WHERE barberia_id = ? ORDER BY creado_en DESC',
        [barberiaId]
      );
      return rows as Usuario[];
    }

    const [rows] = await db.execute('SELECT * FROM usuarios ORDER BY creado_en DESC');
    return rows as Usuario[];
  }

  async findById(id: number): Promise<Usuario | null> {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
    const result = rows as Usuario[];
    return result.length > 0 ? result[0] : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    const result = rows as Usuario[];
    return result.length > 0 ? result[0] : null;
  }

  async create(data: Omit<Usuario, 'id' | 'creado_en'>): Promise<number> {
    const [result] = await db.execute(
      `INSERT INTO usuarios (barberia_id, nombre, email, password_hash, rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.barberia_id,
        data.nombre,
        data.email,
        data.password_hash,
        data.rol,
        data.activo
      ]
    );

    return (result as any).insertId;
  }

  async update(id: number, data: Partial<Omit<Usuario, 'id' | 'creado_en'>>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.barberia_id !== undefined) {
      fields.push('barberia_id = ?');
      values.push(data.barberia_id);
    }
    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.password_hash !== undefined) {
      fields.push('password_hash = ?');
      values.push(data.password_hash);
    }
    if (data.rol !== undefined) {
      fields.push('rol = ?');
      values.push(data.rol);
    }
    if (data.activo !== undefined) {
      fields.push('activo = ?');
      values.push(data.activo);
    }

    if (fields.length === 0) {
      return;
    }

    values.push(id);
    await db.execute(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
  }
}

export const usuarioRepository = new UsuarioRepository();

