import { z } from 'zod';

export const disponibilidadQuerySchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  servicioIds: z
    .string()
    .min(1)
    .transform((s) =>
      s
        .split(',')
        .map((v) => parseInt(v.trim(), 10))
        .filter((n) => !Number.isNaN(n) && n > 0)
    )
    .refine((arr) => arr.length > 0, 'servicioIds requerido'),
  profesionalId: z.coerce.number().int().positive().optional(),
});

export const createReservaPublicaSchema = z.object({
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
  cliente: z.object({
    nombre: z.string().min(2).max(255),
    telefono: z.string().min(8).max(20),
    email: z.string().email().optional().or(z.literal('')),
  }),
  notas: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export const reprogramarReservaSchema = z.object({
  fechaInicio: z.string().datetime(),
  profesionalId: z.number().int().positive().nullable().optional(),
});
