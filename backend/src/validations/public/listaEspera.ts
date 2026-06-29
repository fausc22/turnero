import { z } from 'zod';

export const createListaEsperaSchema = z.object({
  servicioIds: z.array(z.number().int().positive()).min(1),
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cliente: z.object({
    nombre: z.string().min(1).max(255),
    telefono: z.string().min(6).max(30),
    email: z.string().email().optional(),
  }),
});
