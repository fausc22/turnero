// Tipos compartidos con el backend
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

export interface Barberia {
  id: number;
  nombre: string;
  slug: string;
  email: string;
  telefono: string | null;
  activa: boolean;
  creada_en: string;
}

export interface Usuario {
  id: number;
  barberia_id: number | null;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  creado_en: string;
}

export interface Cliente {
  id: number;
  barberia_id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  creado_en: string;
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
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoTurno;
  precio_total: number;
  creado_en: string;
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
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string | null;
}

export interface EstilosBarberia {
  barberia_id: number;
  logo_url: string | null;
  color_primario: string | null;
  imagen_portada: string | null;
  texto_bienvenida: string | null;
}

export interface Membresia {
  id: number;
  barberia_id: number;
  cliente_id: number;
  puntos_acumulados: number;
  actualizado_en: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    statusCode: number;
  };
}

