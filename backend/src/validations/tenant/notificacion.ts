import { z } from 'zod';

export const plantillaParamsSchema = z.object({
  tipo: z.enum(['confirmacion', 'recordatorio_24h', 'recordatorio_2h', 'cancelacion']),
  canal: z.enum(['whatsapp', 'email']),
});

export const updatePlantillaSchema = z.object({
  cuerpo: z.string().min(1).max(10000),
});

export const updateNotificationFeaturesSchema = z.object({
  recordatorio24h: z.boolean().optional(),
  recordatorio2h: z.boolean().optional(),
});

export const turnoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
