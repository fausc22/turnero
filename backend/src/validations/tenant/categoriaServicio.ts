import { z } from 'zod';

export const categoriaIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createCategoriaSchema = z.object({
  nombre: z.string().min(1).max(255),
  orden: z.number().int().min(0).optional(),
});

export const updateCategoriaSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  orden: z.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});
