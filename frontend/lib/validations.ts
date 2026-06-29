import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  email: z.string().email('Email inválido').nullable().optional(),
  telefono: z.string().max(50).nullable().optional(),
});

export const servicioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  duracion_minutos: z.number().int().positive('La duración debe ser positiva'),
  precio: z.number().positive('El precio debe ser positivo'),
  activo: z.boolean().default(true),
});

export const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  precio: z.number().positive('El precio debe ser positivo'),
  stock_actual: z.number().int().min(0).default(0),
  activo: z.boolean().default(true),
});

export const turnoSchema = z.object({
  cliente_id: z.number().int().positive(),
  fecha_inicio: z.string().datetime('Fecha inválida'),
  fecha_fin: z.string().datetime('Fecha inválida'),
  servicios: z.array(z.number().int().positive()).optional(),
  productos: z.array(z.object({
    producto_id: z.number().int().positive(),
    cantidad: z.number().int().positive(),
  })).optional(),
});

