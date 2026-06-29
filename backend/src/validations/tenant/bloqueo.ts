import { z } from 'zod';

export const listBloqueosQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  profesionalId: z.coerce.number().int().positive().optional(),
});

export const bloqueoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createBloqueoSchema = z.object({
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  motivo: z.string().max(255).optional(),
  profesionalId: z.number().int().positive().nullable().optional(),
});
