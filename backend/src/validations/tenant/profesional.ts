import { z } from 'zod';

export const profesionalIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createProfesionalSchema = z.object({
  nombre: z.string().min(2).max(255),
  especialidad: z.string().max(255).optional(),
  fotoPath: z.string().max(500).optional(),
  orden: z.number().int().min(0).optional(),
  servicioIds: z.array(z.number().int().positive()).optional(),
});

export const updateProfesionalSchema = createProfesionalSchema.partial().extend({
  activo: z.number().int().min(0).max(1).optional(),
});
