import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido');

export const updateTenantMetaSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  telefono: z.string().max(50).nullable().optional(),
  direccion: z.string().max(500).nullable().optional(),
  timezone: z.string().max(64).optional(),
  textoBienvenida: z.string().max(5000).nullable().optional(),
});

export const updateTenantEstilosSchema = z.object({
  colorPrimario: hexColor.nullable().optional(),
  colorAcento: hexColor.nullable().optional(),
});

export const estadisticasQuerySchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});
