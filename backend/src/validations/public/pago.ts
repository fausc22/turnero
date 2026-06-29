import { z } from 'zod';

export const createPreferenceSchema = z.object({
  turnoId: z.number().int().positive(),
  tokenGestion: z.string().min(10).max(255),
});
