import { z } from 'zod';

const franjaSchema = z.object({
  horaInicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  horaFin: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  profesionalId: z.number().int().positive().nullable().optional(),
});

export const replaceHorarioDaySchema = z.object({
  diaSemana: z.number().int().min(0).max(6),
  profesionalId: z.number().int().positive().nullable().optional(),
  franjas: z.array(franjaSchema),
});

export const horarioIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
