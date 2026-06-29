import * as usuarioRepo from '../repositories/tenant/usuarioRepository';
import * as profesionalRepo from '../repositories/tenant/profesionalRepository';
import * as indexRepo from '../repositories/admin/tenantUserIndexRepository';
import { hashPassword } from '../utils/password';
import { AppError, NotFoundError } from '../utils/errors';
import { getTenantContext } from '../context/tenantContext';
import { assertCanCreateUsuario } from './planLimitsService';

const ROLES = new Set(['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL']);

function mapUsuario(row: usuarioRepo.UsuarioListRow) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    activo: Boolean(row.activo),
    profesionalId: row.profesional_id,
    profesionalNombre: row.profesional_nombre ?? null,
  };
}

async function validateProfesionalLink(rol: string, profesionalId?: number | null): Promise<void> {
  if (rol === 'PROFESIONAL') {
    if (!profesionalId) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Profesional requerido para rol PROFESIONAL');
    }
    const pro = await profesionalRepo.findById(profesionalId);
    if (!pro || !pro.activo) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Profesional inválido');
    }
  }
}

export async function listUsuarios() {
  const rows = await usuarioRepo.listUsuarios();
  return rows.map(mapUsuario);
}

export async function createUsuario(input: {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  profesionalId?: number | null;
}) {
  if (!ROLES.has(input.rol)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Rol inválido');
  }
  await assertCanCreateUsuario();
  await validateProfesionalLink(input.rol, input.profesionalId);

  const existing = await usuarioRepo.findUsuarioByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Ya existe un usuario con ese email');
  }

  const passwordHash = await hashPassword(input.password);
  const id = await usuarioRepo.createUsuario({
    nombre: input.nombre,
    email: input.email,
    passwordHash,
    rol: input.rol,
    profesionalId: input.rol === 'PROFESIONAL' ? input.profesionalId : null,
  });

  const ctx = getTenantContext();
  if (ctx) {
    await indexRepo.upsertIndex({
      tenantId: ctx.tenantId,
      tenantSlug: ctx.tenantSlug,
      email: input.email,
      usuarioId: id,
    });
  }

  const rows = await usuarioRepo.listUsuarios();
  const created = rows.find((r) => r.id === id);
  if (!created) throw new NotFoundError('Usuario');
  return mapUsuario(created);
}

export async function updateUsuario(
  id: number,
  input: {
    nombre?: string;
    email?: string;
    password?: string;
    rol?: string;
    profesionalId?: number | null;
  },
  actorId: number
) {
  const usuario = await usuarioRepo.findUsuarioById(id);
  if (!usuario) throw new NotFoundError('Usuario');

  const newRol = input.rol ?? usuario.rol;
  if (input.rol && !ROLES.has(input.rol)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Rol inválido');
  }

  if (usuario.rol === 'GERENTE' && newRol !== 'GERENTE' && usuario.activo) {
    const gerentes = await usuarioRepo.countGerentesActivos();
    if (gerentes <= 1) {
      throw new AppError(400, 'LAST_GERENTE', 'No podés cambiar el rol del único gerente activo');
    }
  }

  await validateProfesionalLink(newRol, input.profesionalId ?? usuario.profesional_id);

  const oldEmail = usuario.email;
  let passwordHash: string | undefined;
  if (input.password) {
    passwordHash = await hashPassword(input.password);
  }

  if (input.email && input.email.toLowerCase() !== oldEmail) {
    const dup = await usuarioRepo.findUsuarioByEmail(input.email);
    if (dup && dup.id !== id) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Ya existe un usuario con ese email');
    }
  }

  await usuarioRepo.updateUsuario(id, {
    nombre: input.nombre,
    email: input.email,
    passwordHash,
    rol: input.rol,
    profesionalId: newRol === 'PROFESIONAL' ? (input.profesionalId ?? usuario.profesional_id) : null,
  });

  const ctx = getTenantContext();
  if (ctx && input.email && input.email.toLowerCase() !== oldEmail) {
    await indexRepo.removeByEmail(oldEmail);
    await indexRepo.upsertIndex({
      tenantId: ctx.tenantId,
      tenantSlug: ctx.tenantSlug,
      email: input.email,
      usuarioId: id,
    });
  }

  void actorId;
  const rows = await usuarioRepo.listUsuarios();
  const updated = rows.find((r) => r.id === id)!;
  return mapUsuario(updated);
}

export async function setUsuarioActivo(id: number, activo: boolean, actorId: number) {
  const usuario = await usuarioRepo.findUsuarioById(id);
  if (!usuario) throw new NotFoundError('Usuario');

  if (id === actorId && !activo) {
    throw new AppError(400, 'SELF_DEACTIVATE', 'No podés desactivar tu propia cuenta');
  }

  if (usuario.rol === 'GERENTE' && usuario.activo && !activo) {
    const gerentes = await usuarioRepo.countGerentesActivos();
    if (gerentes <= 1) {
      throw new AppError(400, 'LAST_GERENTE', 'No podés desactivar el único gerente activo');
    }
  }

  await usuarioRepo.updateUsuario(id, { activo: activo ? 1 : 0 });

  if (!activo) {
    await indexRepo.removeByEmail(usuario.email);
  } else {
    const ctx = getTenantContext();
    if (ctx) {
      await indexRepo.upsertIndex({
        tenantId: ctx.tenantId,
        tenantSlug: ctx.tenantSlug,
        email: usuario.email,
        usuarioId: id,
      });
    }
  }

  const rows = await usuarioRepo.listUsuarios();
  const updated = rows.find((r) => r.id === id)!;
  return mapUsuario(updated);
}
