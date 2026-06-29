import { z } from 'zod';

export const servicioIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createServicioSchema = z.object({
  categoriaId: z.number().int().positive().nullable().optional(),
  nombre: z.string().min(2).max(255),
  descripcion: z.string().max(2000).optional(),
  duracionMinutos: z.number().int().positive().max(480),
  precio: z.number().positive(),
  orden: z.number().int().min(0).optional(),
});

export const updateServicioSchema = createServicioSchema.partial().extend({
  activo: z.number().int().min(0).max(1).optional(),
});
