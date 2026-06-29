import { z } from 'zod';

export const clienteFormSchema = z.object({
  nombre: z.string().min(2, 'Ingresá tu nombre').max(255),
  telefono: z.string().min(8, 'Teléfono inválido').max(20),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notas: z.string().max(500).optional(),
  aceptaPolitica: z.literal(true, {
    errorMap: () => ({ message: 'Debés aceptar la política de cancelación' }),
  }),
});

export type ClienteFormValues = z.infer<typeof clienteFormSchema>;
