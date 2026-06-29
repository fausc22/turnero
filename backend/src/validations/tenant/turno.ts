import { z } from 'zod';

export const listTurnosQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  estado: z.enum(['PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'NO_ASISTIO', 'COMPLETADO']).optional(),
  profesionalId: z.coerce.number().int().positive().optional(),
  search: z.string().max(255).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const agendaQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  profesionalId: z.coerce.number().int().positive().optional(),
  vista: z.enum(['day', 'week']).optional(),
});

export const turnoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createTurnoManualSchema = z.object({
  clienteId: z.number().int().positive().optional(),
  cliente: z
    .object({
      nombre: z.string().min(2).max(255),
      telefono: z.string().min(8).max(20),
      email: z.string().email().optional().or(z.literal('')),
    })
    .optional(),
  servicioIds: z.array(z.number().int().positive()).min(1),
  productos: z
    .array(
      z.object({
        productoId: z.number().int().positive(),
        cantidad: z.number().int().min(1).max(10),
      })
    )
    .optional(),
  profesionalId: z.number().int().positive().nullable().optional(),
  fechaInicio: z.string().datetime(),
  notas: z.string().max(500).optional(),
});

export const patchTurnoEstadoSchema = z.object({
  estado: z.enum(['CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'NO_ASISTIO']),
});

export const reprogramarTurnoSchema = z.object({
  fechaInicio: z.string().datetime(),
  profesionalId: z.number().int().positive().nullable().optional(),
});
