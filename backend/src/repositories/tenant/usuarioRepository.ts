import { RowDataPacket } from 'mysql2/promise';
import { executeTenantQuery, executeTenantMutation } from '../../config/tenantDatabase';

export interface TenantUsuarioRow {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: string;
  activo: number;
  profesional_id: number | null;
  onboarding_completado: number;
}

export async function findUsuarioByEmail(email: string): Promise<TenantUsuarioRow | null> {
  const rows = await executeTenantQuery<(TenantUsuarioRow & RowDataPacket)[]>(
    `SELECT id, nombre, email, password_hash, rol, activo, profesional_id,
            COALESCE(onboarding_completado, 0) AS onboarding_completado
     FROM usuarios WHERE email = ? LIMIT 1`,
    [email.toLowerCase()]
  );
  return rows[0] ?? null;
}

export async function findUsuarioById(id: number): Promise<TenantUsuarioRow | null> {
  const rows = await executeTenantQuery<(TenantUsuarioRow & RowDataPacket)[]>(
    `SELECT id, nombre, email, password_hash, rol, activo, profesional_id,
            COALESCE(onboarding_completado, 0) AS onboarding_completado
     FROM usuarios WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function markOnboardingComplete(id: number): Promise<void> {
  await executeTenantQuery(`UPDATE usuarios SET onboarding_completado = 1 WHERE id = ?`, [id]);
}

export interface UsuarioListRow {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: number;
  profesional_id: number | null;
  profesional_nombre?: string | null;
}

export async function listUsuarios(): Promise<UsuarioListRow[]> {
  return executeTenantQuery<(UsuarioListRow & RowDataPacket)[]>(
    `SELECT u.id, u.nombre, u.email, u.rol, u.activo, u.profesional_id,
            p.nombre AS profesional_nombre
     FROM usuarios u
     LEFT JOIN profesionales p ON p.id = u.profesional_id
     ORDER BY u.nombre`
  );
}

export async function countActivos(): Promise<number> {
  const rows = await executeTenantQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(*) AS cnt FROM usuarios WHERE activo = 1`
  );
  return rows[0]?.cnt ?? 0;
}

export async function countGerentesActivos(): Promise<number> {
  const rows = await executeTenantQuery<(RowDataPacket & { cnt: number })[]>(
    `SELECT COUNT(*) AS cnt FROM usuarios WHERE activo = 1 AND rol = 'GERENTE'`
  );
  return rows[0]?.cnt ?? 0;
}

export async function createUsuario(data: {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: string;
  profesionalId?: number | null;
}): Promise<number> {
  const result = await executeTenantMutation(
    `INSERT INTO usuarios (nombre, email, password_hash, rol, profesional_id, activo)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [
      data.nombre,
      data.email.toLowerCase(),
      data.passwordHash,
      data.rol,
      data.profesionalId ?? null,
    ]
  );
  return result.insertId;
}

export async function updateUsuario(
  id: number,
  data: {
    nombre?: string;
    email?: string;
    passwordHash?: string;
    rol?: string;
    profesionalId?: number | null;
    activo?: number;
  }
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.nombre !== undefined) {
    fields.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    params.push(data.email.toLowerCase());
  }
  if (data.passwordHash !== undefined) {
    fields.push('password_hash = ?');
    params.push(data.passwordHash);
  }
  if (data.rol !== undefined) {
    fields.push('rol = ?');
    params.push(data.rol);
  }
  if (data.profesionalId !== undefined) {
    fields.push('profesional_id = ?');
    params.push(data.profesionalId);
  }
  if (data.activo !== undefined) {
    fields.push('activo = ?');
    params.push(data.activo);
  }

  if (!fields.length) return;
  params.push(id);
  await executeTenantMutation(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, params);
}
