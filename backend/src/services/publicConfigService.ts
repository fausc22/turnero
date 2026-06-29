import { getTenantContext } from '../context/tenantContext';
import * as tenantMetaRepo from '../repositories/tenant/tenantMetaRepository';
import * as politicasRepo from '../repositories/tenant/politicasRepository';
import { isPagoOnlineConfigured } from '../utils/calcMontoPago';

export async function getPublicConfig() {
  const ctx = getTenantContext();
  const [meta, estilos, politicas] = await Promise.all([
    tenantMetaRepo.getTenantMeta(),
    tenantMetaRepo.getTenantEstilos(),
    politicasRepo.getPoliticas(),
  ]);

  const pageStatus = ctx?.pageStatus ?? 'ACTIVA';
  const bookingEnabled = pageStatus === 'ACTIVA';

  return {
    nombre: meta?.nombre ?? '',
    email: meta?.email ?? '',
    telefono: meta?.telefono ?? null,
    direccion: meta?.direccion ?? null,
    direccionLat: meta?.direccion_lat != null ? Number(meta.direccion_lat) : null,
    direccionLng: meta?.direccion_lng != null ? Number(meta.direccion_lng) : null,
    timezone: meta?.timezone ?? 'America/Argentina/Buenos_Aires',
    textoBienvenida: meta?.texto_bienvenida ?? null,
    estilos: estilos
      ? {
          colorPrimario: estilos.color_primario,
          colorAcento: estilos.color_acento,
          logoPath: estilos.logo_path,
          faviconPath: estilos.favicon_path,
          heroPath: estilos.hero_path,
        }
      : null,
    politicas: politicas
      ? {
          anticipacionMinimaMinutos: politicas.anticipacion_minima_minutos,
          anticipacionMaximaDias: politicas.anticipacion_maxima_dias,
          cancelacionHorasMinimas: politicas.cancelacion_horas_minimas,
          bufferMinutos: politicas.buffer_minutos,
          slotGranularidadMinutos: politicas.slot_granularidad_minutos,
          modoPago: politicas.modo_pago,
          señaPorcentaje: politicas.seña_porcentaje,
          señaMontoFijo: politicas.seña_monto_fijo,
          pagoOnlineDisponible: isPagoOnlineConfigured(politicas),
        }
      : null,
    pageStatus,
    plan: ctx?.plan ?? 'trial',
    bookingEnabled,
  };
}
