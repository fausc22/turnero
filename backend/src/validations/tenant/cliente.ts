import { z } from 'zod';

export const listClientesQuerySchema = z.object({
  search: z.string().max(255).optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const clienteIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createClienteSchema = z.object({
  nombre: z.string().min(2).max(255),
  telefono: z.string().min(8).max(20).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  notasInternas: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateClienteSchema = createClienteSchema.partial();
