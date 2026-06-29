export type PageStatus = 'ACTIVA' | 'PAUSADA' | 'MANTENIMIENTO' | 'BLOQUEADA';

export type ModoPago =
  | 'SIN_PAGO'
  | 'SEÑA_PORCENTAJE'
  | 'SEÑA_FIJA'
  | 'PAGO_TOTAL'
  | 'PAGO_EN_LOCAL';

export interface PublicConfig {
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  direccionLat: number | null;
  direccionLng: number | null;
  timezone: string;
  textoBienvenida: string | null;
  estilos: {
    colorPrimario: string | null;
    colorAcento: string | null;
    logoPath: string | null;
    faviconPath: string | null;
    heroPath: string | null;
  } | null;
  politicas: {
    anticipacionMinimaMinutos: number;
    anticipacionMaximaDias: number;
    cancelacionHorasMinimas: number;
    bufferMinutos: number;
    slotGranularidadMinutos: number;
    modoPago: ModoPago;
    señaPorcentaje: number | null;
    señaMontoFijo: number | null;
    pagoOnlineDisponible: boolean;
  } | null;
  pageStatus: PageStatus;
  plan: string;
  bookingEnabled: boolean;
}

export interface ServicioPublico {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number;
  orden: number;
}

export interface CategoriaServicios {
  nombre: string;
  servicios: ServicioPublico[];
}

export interface ProfesionalPublico {
  id: number;
  nombre: string;
  especialidad: string | null;
  fotoPath: string | null;
  servicioIds: number[];
  orden: number;
}

export interface Slot {
  fechaInicio: string;
  fechaFin: string;
  profesionalId: number | null;
  profesionalNombre?: string;
}

export interface ReservaResponse {
  turnoId: number;
  tokenGestion: string;
  estado: string;
  precioTotal: number;
  gestionarUrl: string;
}

export interface TurnoDetalle {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  profesionalId: number | null;
  precioTotal: number;
  notasCliente: string | null;
  reprogramacionesCount: number;
  servicios: {
    servicioId: number;
    nombre: string;
    precioUnitario: number;
  }[];
  politicas: {
    cancelacionHorasMinimas: number;
    maxReprogramaciones: number;
  } | null;
}

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}
