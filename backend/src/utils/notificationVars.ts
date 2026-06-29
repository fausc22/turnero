import { buildGestionUrl } from '../services/reservationTokenService';
import type { TenantMetaRow } from '../repositories/tenant/tenantMetaRepository';

export interface TurnoNotificationData {
  clienteNombre: string;
  fechaInicio: Date;
  tokenGestion?: string | null;
}

function formatFecha(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatHora(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export function buildNotificationVars(
  turno: TurnoNotificationData,
  meta: TenantMetaRow | null
): Record<string, string> {
  const fechaInicio = new Date(turno.fechaInicio);
  return {
    clienteNombre: turno.clienteNombre,
    cliente_nombre: turno.clienteNombre,
    fecha: formatFecha(fechaInicio),
    hora: formatHora(fechaInicio),
    localNombre: meta?.nombre ?? 'Tu local',
    local_nombre: meta?.nombre ?? 'Tu local',
    direccion: meta?.direccion ?? '',
    linkGestion: turno.tokenGestion ? buildGestionUrl(turno.tokenGestion) : '',
  };
}

export function clientBaseUrl(tenantSlug: string): string {
  const host = process.env.CLIENT_BASE_HOST || 'localhost:4010';
  const scheme =
    process.env.CLIENT_BASE_SCHEME || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  return `${scheme}://${tenantSlug}.${host}`;
}
