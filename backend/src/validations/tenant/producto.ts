import { z } from 'zod';

export const productoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createProductoSchema = z.object({
  nombre: z.string().min(2).max(255),
  precio: z.number().positive(),
  stockActual: z.number().int().min(0).optional(),
  orden: z.number().int().min(0).optional(),
});

export const updateProductoSchema = createProductoSchema.partial().extend({
  activo: z.number().int().min(0).max(1).optional(),
});
