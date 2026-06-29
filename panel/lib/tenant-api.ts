import api from './api';

export interface TurnoListItem {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteTelefono: string | null;
  profesionalId: number | null;
  profesionalNombre: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  precioTotal: number;
  notasCliente: string | null;
}

export async function fetchTurnos(params: Record<string, string | number | undefined>) {
  const { data } = await api.get<{ success: boolean; data: TurnoListItem[] }>(
    '/api/tenant/turnos',
    { params }
  );
  return data.data;
}

export interface AgendaData {
  turnos: TurnoListItem[];
  byProfesional: Record<string, TurnoListItem[]>;
}

export async function fetchAgenda(params: { from: string; to: string; profesionalId?: number }) {
  const { data } = await api.get<{ success: boolean; data: AgendaData }>('/api/tenant/agenda', {
    params,
  });
  return data.data;
}

export async function fetchMe() {
  const { data } = await api.get<{
    success: boolean;
    data: {
      id: number;
      email: string;
      nombre: string;
      rol: string;
      profesionalId?: number | null;
      onboardingCompletado?: boolean;
    };
  }>('/api/tenant/me');
  return data.data;
}

export async function fetchTurno(id: number) {
  const { data } = await api.get<{ success: boolean; data: unknown }>(`/api/tenant/turnos/${id}`);
  return data.data;
}

export async function patchTurnoEstado(id: number, estado: string) {
  const { data } = await api.patch(`/api/tenant/turnos/${id}/estado`, { estado });
  return data.data;
}

export async function reprogramarTurno(id: number, body: { fechaInicio: string; profesionalId?: number | null }) {
  const { data } = await api.patch(`/api/tenant/turnos/${id}`, body);
  return data.data;
}

export async function createTurnoManual(body: unknown) {
  const { data } = await api.post('/api/tenant/turnos', body);
  return data.data;
}

export async function fetchClientes(search?: string) {
  const { data } = await api.get('/api/tenant/clientes', { params: { search } });
  return data.data;
}

export async function fetchCliente(id: number) {
  const { data } = await api.get(`/api/tenant/clientes/${id}`);
  return data.data;
}

export async function saveCliente(body: unknown, id?: number) {
  if (id) {
    const { data } = await api.put(`/api/tenant/clientes/${id}`, body);
    return data.data;
  }
  const { data } = await api.post('/api/tenant/clientes', body);
  return data.data;
}

export async function fetchClienteHistorial(id: number) {
  const { data } = await api.get(`/api/tenant/clientes/${id}/historial`);
  return data.data;
}

export async function fetchServicios() {
  const { data } = await api.get('/api/tenant/servicios');
  return data.data;
}

export async function saveServicio(body: unknown, id?: number) {
  if (id) return (await api.put(`/api/tenant/servicios/${id}`, body)).data.data;
  return (await api.post('/api/tenant/servicios', body)).data.data;
}

export async function fetchProductos() {
  const { data } = await api.get('/api/tenant/productos');
  return data.data;
}

export async function saveProducto(body: unknown, id?: number) {
  if (id) return (await api.put(`/api/tenant/productos/${id}`, body)).data.data;
  return (await api.post('/api/tenant/productos', body)).data.data;
}

export async function fetchProfesionales() {
  const { data } = await api.get('/api/tenant/profesionales');
  return data.data;
}

export async function saveProfesional(body: unknown, id?: number) {
  if (id) return (await api.put(`/api/tenant/profesionales/${id}`, body)).data.data;
  return (await api.post('/api/tenant/profesionales', body)).data.data;
}

export async function fetchHorarios() {
  const { data } = await api.get('/api/tenant/horarios-operativos');
  return data.data;
}

export async function saveHorariosDia(diaSemana: number, franjas: unknown[]) {
  const { data } = await api.put('/api/tenant/horarios-operativos', { diaSemana, franjas });
  return data.data;
}

export async function fetchBloqueos(from?: string, to?: string) {
  const { data } = await api.get('/api/tenant/bloqueos', { params: { from, to } });
  return data.data;
}

export async function createBloqueo(body: unknown) {
  const { data } = await api.post('/api/tenant/bloqueos', body);
  return data.data;
}

export async function deleteBloqueo(id: number) {
  await api.delete(`/api/tenant/bloqueos/${id}`);
}

export interface PoliticasReserva {
  modoPago: string;
  señaPorcentaje: number | null;
  señaMontoFijo: number | null;
  mpAccessTokenMasked: string | null;
  mpConfigured: boolean;
}

export async function fetchPoliticasReserva() {
  const { data } = await api.get<{ success: boolean; data: PoliticasReserva }>(
    '/api/tenant/politicas-reserva'
  );
  return data.data;
}

export async function savePoliticasReserva(body: Record<string, unknown>) {
  const { data } = await api.put('/api/tenant/politicas-reserva', body);
  return data.data;
}

export async function testMpConnection(mpAccessToken?: string) {
  const { data } = await api.post('/api/tenant/politicas-reserva/test-mp', {
    mpAccessToken,
  });
  return data.data;
}

export interface PagoListItem {
  id: number;
  turnoId: number | null;
  clienteNombre: string | null;
  monto: number;
  estado: string;
  referenciaExterna: string | null;
  creadoEn: string;
}

export async function fetchPagos(params?: Record<string, string | undefined>) {
  const { data } = await api.get<{ success: boolean; data: PagoListItem[] }>(
    '/api/tenant/pagos',
    { params }
  );
  return data.data;
}

export function getApiErrorCode(err: unknown): string | undefined {
  return (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
}

export interface WhatsappStatus {
  connected: boolean;
  phone: string | null;
  updatedAt: string;
}

export async function fetchWhatsappStatus() {
  const { data } = await api.get<{ success: boolean; data: WhatsappStatus }>(
    '/api/tenant/notificaciones/whatsapp-status'
  );
  return data.data;
}

export async function reconnectWhatsapp() {
  const { data } = await api.post('/api/tenant/notificaciones/whatsapp-reconnect');
  return data.data;
}

export interface NotificationFeatures {
  recordatorio24h: boolean;
  recordatorio2h: boolean;
}

export async function fetchNotificationFeatures() {
  const { data } = await api.get<{ success: boolean; data: NotificationFeatures }>(
    '/api/tenant/notificaciones/features'
  );
  return data.data;
}

export async function saveNotificationFeatures(body: NotificationFeatures) {
  const { data } = await api.put('/api/tenant/notificaciones/features', {
    recordatorio24h: body.recordatorio24h,
    recordatorio2h: body.recordatorio2h,
  });
  return data.data;
}

export interface PlantillaNotificacion {
  tipo: string;
  canal: string;
  cuerpo: string;
}

export async function fetchPlantillasNotificacion() {
  const { data } = await api.get<{ success: boolean; data: PlantillaNotificacion[] }>(
    '/api/tenant/plantillas-notificacion'
  );
  return data.data;
}

export async function savePlantillaNotificacion(tipo: string, canal: string, cuerpo: string) {
  const { data } = await api.put(`/api/tenant/plantillas-notificacion/${tipo}/${canal}`, { cuerpo });
  return data.data;
}

export async function reenviarConfirmacionTurno(turnoId: number) {
  const { data } = await api.post(`/api/tenant/turnos/${turnoId}/reenviar-confirmacion`);
  return data.data;
}

export interface TenantMeta {
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  direccionLat: number | null;
  direccionLng: number | null;
  timezone: string;
  textoBienvenida: string | null;
}

export interface TenantEstilos {
  colorPrimario: string | null;
  colorAcento: string | null;
  logoPath: string | null;
  faviconPath: string | null;
  heroPath: string | null;
}

export async function fetchTenantMeta() {
  const { data } = await api.get<{ success: boolean; data: TenantMeta }>('/api/tenant/tenant-meta');
  return data.data;
}

export async function saveTenantMeta(body: Partial<TenantMeta>) {
  const { data } = await api.put('/api/tenant/tenant-meta', body);
  return data.data;
}

export async function fetchTenantEstilos() {
  const { data } = await api.get<{ success: boolean; data: TenantEstilos }>(
    '/api/tenant/tenant-estilos'
  );
  return data.data;
}

export async function saveTenantEstilos(body: Partial<TenantEstilos>) {
  const { data } = await api.put('/api/tenant/tenant-estilos', body);
  return data.data;
}

export async function geocodeTenantDireccion() {
  const { data } = await api.post('/api/tenant/tenant-meta/geocode');
  return data.data as { lat: number; lng: number; formatted?: string };
}

export async function uploadTenantMedia(type: 'logo' | 'favicon' | 'hero', file: File) {
  const form = new FormData();
  form.append('type', type);
  form.append('file', file);
  const { data } = await api.post('/api/tenant/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export interface EstadisticasResumen {
  totalTurnos: number;
  porEstado: Record<string, number>;
  ingresos: number;
  ticketPromedio: number;
  clientesNuevos: number;
  clientesRecurrentes: number;
  tasaNoShow: number;
  turnosPorDia: { fecha: string; total: number }[];
  ingresosPorDia: { fecha: string; total: number }[];
  serviciosTop: { servicioId: number; nombre: string; total: number }[];
  horariosPico: { hora: number; total: number }[];
  advanced: boolean;
}

export async function fetchEstadisticasResumen(from: string, to: string) {
  const { data } = await api.get<{ success: boolean; data: EstadisticasResumen }>(
    '/api/tenant/estadisticas/resumen',
    { params: { from, to } }
  );
  return data.data;
}

export async function completeOnboarding() {
  const { data } = await api.post('/api/tenant/onboarding/complete');
  return data.data;
}

export interface PanelUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  profesionalId: number | null;
  profesionalNombre: string | null;
}

export async function fetchUsuarios() {
  const { data } = await api.get<{ success: boolean; data: PanelUsuario[] }>('/api/tenant/usuarios');
  return data.data;
}

export async function saveUsuario(
  body: {
    nombre: string;
    email: string;
    password?: string;
    rol: string;
    profesionalId?: number | null;
  },
  id?: number
) {
  if (id) {
    const { data } = await api.put(`/api/tenant/usuarios/${id}`, body);
    return data.data;
  }
  const { data } = await api.post('/api/tenant/usuarios', body);
  return data.data;
}

export async function patchUsuarioActivo(id: number, activo: boolean) {
  const { data } = await api.patch(`/api/tenant/usuarios/${id}/activo`, { activo });
  return data.data;
}

export interface CategoriaServicio {
  id: number;
  nombre: string;
  orden: number;
  activo: boolean;
}

export async function fetchCategoriasServicio() {
  const { data } = await api.get<{ success: boolean; data: CategoriaServicio[] }>(
    '/api/tenant/categorias-servicio'
  );
  return data.data;
}

export async function saveCategoriaServicio(
  body: { nombre: string; orden?: number; activo?: boolean },
  id?: number
) {
  if (id) {
    const { data } = await api.put(`/api/tenant/categorias-servicio/${id}`, body);
    return data.data;
  }
  const { data } = await api.post('/api/tenant/categorias-servicio', body);
  return data.data;
}

export interface ListaEsperaItem {
  id: number;
  clienteNombre: string;
  clienteTelefono: string | null;
  servicios: { id: number; nombre: string }[];
  fechaDesde: string;
  fechaHasta: string;
  notificado: boolean;
  creadoEn: string;
}

export async function fetchListaEspera() {
  const { data } = await api.get<{ success: boolean; data: ListaEsperaItem[] }>(
    '/api/tenant/lista-espera'
  );
  return data.data;
}

export async function removeListaEspera(id: number) {
  await api.delete(`/api/tenant/lista-espera/${id}`);
}

export async function saveClienteFull(
  body: {
    nombre?: string;
    telefono?: string;
    email?: string;
    notasInternas?: string;
    tags?: string[];
  },
  id: number
) {
  const { data } = await api.put(`/api/tenant/clientes/${id}`, body);
  return data.data;
}
