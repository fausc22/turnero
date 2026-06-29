import { Request } from 'express';

export enum Rol {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_BARBERIA = 'ADMIN_BARBERIA',
  BARBERO = 'BARBERO'
}

export enum EstadoTurno {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  NO_ASISTIO = 'NO_ASISTIO'
}

export enum EstadoPago {
  PAGADO = 'PAGADO',
  FALLIDO = 'FALLIDO',
  DEVUELTO = 'DEVUELTO'
}

export enum ProveedorPago {
  MERCADO_PAGO = 'MERCADO_PAGO'
}

export interface Barberia {
  id: number;
  nombre: string;
  slug: string;
  email: string;
  telefono: string | null;
  activa: boolean;
  creada_en: Date;
}

export interface Usuario {
  id: number;
  barberia_id: number | null;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Rol;
  activo: boolean;
  creado_en: Date;
}

export interface Cliente {
  id: number;
  barberia_id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  creado_en: Date;
}

export interface Servicio {
  id: number;
  barberia_id: number;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  activo: boolean;
}

export interface Producto {
  id: number;
  barberia_id: number;
  nombre: string;
  precio: number;
  stock_actual: number;
  activo: boolean;
}

export interface Turno {
  id: number;
  barberia_id: number;
  cliente_id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: EstadoTurno;
  precio_total: number;
  creado_en: Date;
}

export interface TurnoServicio {
  id: number;
  turno_id: number;
  servicio_id: number;
  precio_unitario: number;
}

export interface TurnoProducto {
  id: number;
  turno_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
}

export interface Pago {
  id: number;
  barberia_id: number;
  turno_id: number | null;
  monto: number;
  estado: EstadoPago;
  proveedor: ProveedorPago;
  referencia_externa: string | null;
  creado_en: Date;
}

export interface HorarioBarberia {
  id: number;
  barberia_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface BloqueoHorario {
  id: number;
  barberia_id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  motivo: string | null;
}

export interface JwtPayload {
  usuarioId: number;
  email: string;
  rol: Rol;
  barberiaId: number | null;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

