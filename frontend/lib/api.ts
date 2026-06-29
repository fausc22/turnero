import axios, { AxiosError } from 'axios';
import type {
  ApiErrorBody,
  CategoriaServicios,
  ProfesionalPublico,
  PublicConfig,
  ReservaResponse,
  Slot,
  TurnoDetalle,
} from '@/types/public';
import { getTenantSlug } from '@/lib/tenant-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013';

export const publicApi = axios.create({
  baseURL: `${API_URL}/api/public`,
  headers: { 'Content-Type': 'application/json' },
});

publicApi.interceptors.request.use((config) => {
  const slug = getTenantSlug();
  if (slug) {
    config.headers['x-tenant-slug'] = slug;
  }
  return config;
});

export function getApiErrorCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorBody)?.error?.code;
  }
  return undefined;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorBody)?.error?.message ?? 'Ocurrió un error';
  }
  return 'Ocurrió un error';
}

export async function fetchConfig(): Promise<PublicConfig> {
  const { data } = await publicApi.get<{ success: boolean; data: PublicConfig }>('/config');
  return data.data;
}

export async function fetchServicios(): Promise<CategoriaServicios[]> {
  const { data } = await publicApi.get<{
    success: boolean;
    data: { categorias: CategoriaServicios[] };
  }>('/servicios');
  return data.data.categorias;
}

export async function fetchProfesionales(): Promise<ProfesionalPublico[]> {
  const { data } = await publicApi.get<{
    success: boolean;
    data: { profesionales: ProfesionalPublico[] };
  }>('/profesionales');
  return data.data.profesionales;
}

export async function fetchDisponibilidad(params: {
  fecha: string;
  servicioIds: number[];
  profesionalId?: number | null;
}): Promise<Slot[]> {
  const qs = new URLSearchParams({
    fecha: params.fecha,
    servicioIds: params.servicioIds.join(','),
  });
  if (params.profesionalId != null) {
    qs.set('profesionalId', String(params.profesionalId));
  }
  const { data } = await publicApi.get<{ success: boolean; data: { slots: Slot[] } }>(
    `/disponibilidad?${qs}`
  );
  return data.data.slots;
}

export async function createReserva(
  body: {
    servicioIds: number[];
    profesionalId?: number | null;
    fechaInicio: string;
    cliente: { nombre: string; telefono: string; email?: string };
    notas?: string;
    idempotencyKey?: string;
  },
  idempotencyKey?: string
): Promise<ReservaResponse> {
  const { data } = await publicApi.post<{ success: boolean; data: ReservaResponse }>(
    '/reservas',
    body,
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined
  );
  return data.data;
}

export async function fetchReservaByToken(token: string): Promise<TurnoDetalle> {
  const { data } = await publicApi.get<{ success: boolean; data: TurnoDetalle }>(
    `/reservas/${token}`
  );
  return data.data;
}

export async function cancelarReserva(token: string): Promise<{ estado: string }> {
  const { data } = await publicApi.post<{ success: boolean; data: { estado: string } }>(
    `/reservas/${token}/cancelar`
  );
  return data.data;
}

export async function reprogramarReserva(
  token: string,
  body: { fechaInicio: string; profesionalId?: number | null }
): Promise<{ fechaInicio: string; fechaFin: string; profesionalId: number | null }> {
  const { data } = await publicApi.post<{
    success: boolean;
    data: { fechaInicio: string; fechaFin: string; profesionalId: number | null };
  }>(`/reservas/${token}/reprogramar`, body);
  return data.data;
}

export async function createPaymentPreference(body: {
  turnoId: number;
  tokenGestion: string;
}): Promise<{ id: string; initPoint: string; monto: number }> {
  const { data } = await publicApi.post<{
    success: boolean;
    data: { id: string; initPoint: string; monto: number };
  }>('/pagos/preference', body);
  return data.data;
}

export async function createListaEspera(body: {
  servicioIds: number[];
  fechaDesde: string;
  fechaHasta: string;
  cliente: { nombre: string; telefono: string; email?: string };
}): Promise<{ id: number; message: string }> {
  const { data } = await publicApi.post<{ success: boolean; data: { id: number; message: string } }>(
    '/lista-espera',
    body
  );
  return data.data;
}

export function assetUrl(type: 'logo' | 'hero' | 'favicon'): string {
  const slug = getTenantSlug();
  return `${API_URL}/api/public/asset/${type}${slug ? '' : ''}`;
}
