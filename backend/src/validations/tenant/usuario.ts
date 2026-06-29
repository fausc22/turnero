import { z } from 'zod';

export const usuarioIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createUsuarioSchema = z.object({
  nombre: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  rol: z.enum(['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL']),
  profesionalId: z.number().int().positive().nullable().optional(),
});

export const updateUsuarioSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
  rol: z.enum(['GERENTE', 'RECEPCIONISTA', 'PROFESIONAL']).optional(),
  profesionalId: z.number().int().positive().nullable().optional(),
});

export const patchUsuarioActivoSchema = z.object({
  activo: z.boolean(),
});
