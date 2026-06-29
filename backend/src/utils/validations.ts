import { z } from 'zod';
import { Rol, EstadoTurno } from '../types';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const superLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const globalLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rememberMe: z.boolean().optional(),
});

const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, 'Slug inválido');

const gerenteSchema = z.object({
  nombre: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
});

export const createTenantSchema = z.object({
  slug: slugSchema,
  nombre: z.string().min(1).max(255),
  plan: z.enum(['trial', 'basico', 'profesional', 'enterprise']).default('trial'),
  page_status: z.enum(['ACTIVA', 'PAUSADA', 'MANTENIMIENTO', 'BLOQUEADA']).optional(),
  trial_ends_at: z.string().datetime().nullable().optional(),
  gerente: gerenteSchema,
  seedDemoData: z.boolean().optional(),
});

export const updateTenantSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  plan: z.enum(['trial', 'basico', 'profesional', 'enterprise']).optional(),
  status: z.enum(['activo', 'suspendido', 'eliminado']).optional(),
  page_status: z.enum(['ACTIVA', 'PAUSADA', 'MANTENIMIENTO', 'BLOQUEADA']).optional(),
  trial_ends_at: z.string().datetime().nullable().optional(),
});

export const reprovisionTenantSchema = z.object({
  gerente: gerenteSchema,
  seedDemoData: z.boolean().optional(),
});

export const createBarberiaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  slug: z.string().min(1, 'El slug es requerido').max(100).regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  email: z.string().email('Email inválido'),
  telefono: z.string().max(50).optional().nullable(),
  activa: z.boolean().default(true)
});

export const updateBarberiaSchema = createBarberiaSchema.partial();

export const createUsuarioSchema = z.object({
  barberia_id: z.number().int().positive().nullable(),
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.nativeEnum(Rol),
  activo: z.boolean().default(true)
});

export const updateUsuarioSchema = z.object({
  barberia_id: z.number().int().positive().nullable().optional(),
  nombre: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.nativeEnum(Rol).optional(),
  activo: z.boolean().optional()
});

export const createClienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  email: z.string().email('Email inválido').nullable().optional(),
  telefono: z.string().max(50).nullable().optional()
});

export const updateClienteSchema = createClienteSchema.partial();

export const createServicioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  duracion_minutos: z.number().int().positive('La duración debe ser positiva'),
  precio: z.number().positive('El precio debe ser positivo'),
  activo: z.boolean().default(true)
});

export const updateServicioSchema = createServicioSchema.partial();

export const createProductoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(255),
  precio: z.number().positive('El precio debe ser positivo'),
  stock_actual: z.number().int().min(0).default(0),
  activo: z.boolean().default(true)
});

export const updateProductoSchema = createProductoSchema.partial();

export const createTurnoSchema = z.object({
  cliente_id: z.number().int().positive(),
  fecha_inicio: z.string().datetime('Fecha inválida'),
  fecha_fin: z.string().datetime('Fecha inválida'),
  estado: z.nativeEnum(EstadoTurno).default(EstadoTurno.PENDIENTE),
  servicios: z.array(z.number().int().positive()).optional(),
  productos: z.array(z.object({
    producto_id: z.number().int().positive(),
    cantidad: z.number().int().positive()
  })).optional()
});

export const updateTurnoSchema = z.object({
  cliente_id: z.number().int().positive().optional(),
  fecha_inicio: z.string().datetime().optional(),
  fecha_fin: z.string().datetime().optional(),
  estado: z.nativeEnum(EstadoTurno).optional()
});

export const createHorarioSchema = z.object({
  dia_semana: z.number().int().min(0).max(6),
  hora_inicio: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Formato de hora inválido (HH:mm:ss)'),
  hora_fin: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Formato de hora inválido (HH:mm:ss)')
});

export const createBloqueoSchema = z.object({
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime(),
  motivo: z.string().max(255).nullable().optional()
});

