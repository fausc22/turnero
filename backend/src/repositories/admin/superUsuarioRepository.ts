import { RowDataPacket } from 'mysql2/promise';
import { executeAdminQuery, executeAdminMutation } from '../../config/adminDatabase';
import type { SuperUsuarioRow } from '../../types/super';

export async function findSuperUsuarioByEmail(email: string): Promise<SuperUsuarioRow | null> {
  const rows = await executeAdminQuery<(SuperUsuarioRow & RowDataPacket)[]>(
    `SELECT id, email, nombre, password_hash, rol, activo, created_at
     FROM super_usuarios WHERE email = ? LIMIT 1`,
    [email.toLowerCase()]
  );
  return rows[0] ?? null;
}

export async function findSuperUsuarioById(id: number): Promise<SuperUsuarioRow | null> {
  const rows = await executeAdminQuery<(SuperUsuarioRow & RowDataPacket)[]>(
    `SELECT id, email, nombre, password_hash, rol, activo, created_at
     FROM super_usuarios WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function upsertSuperUsuario(
  email: string,
  nombre: string,
  passwordHash: string
): Promise<number> {
  const existing = await findSuperUsuarioByEmail(email);
  if (existing) {
    await executeAdminQuery(
      `UPDATE super_usuarios SET nombre = ?, password_hash = ?, activo = 1 WHERE id = ?`,
      [nombre, passwordHash, existing.id]
    );
    return existing.id;
  }

  const result = await executeAdminMutation(
    `INSERT INTO super_usuarios (email, nombre, password_hash, rol, activo)
     VALUES (?, ?, ?, 'superadmin', 1)`,
    [email.toLowerCase(), nombre, passwordHash]
  );
  return result.insertId;
}
