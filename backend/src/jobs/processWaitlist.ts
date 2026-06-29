import { getTenantContext } from '../context/tenantContext';
import * as listaEsperaRepo from '../repositories/tenant/listaEsperaRepository';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import { enqueueForTurno } from '../services/notificationEnqueueService';
import { clientBaseUrl } from '../utils/notificationVars';
import logger from '../config/logger';

function featureEnabled(config: { features?: Record<string, unknown> }): boolean {
  const features = config.features as Record<string, unknown> | undefined;
  return Boolean(features?.lista_espera);
}

export async function processWaitlistForCancelledTurno(turnoId: number): Promise<void> {
  const ctx = getTenantContext();
  if (!ctx || !featureEnabled(ctx.config)) return;

  try {
    const turno = await turnoRepo.findById(turnoId);
    if (!turno) return;

    const servicios = await turnoRepo.getServicios(turnoId);
    const servicioIds = servicios.map((s) => s.servicio_id);
    const fecha = new Date(turno.fecha_inicio);

    const entries = await listaEsperaRepo.findPendingForSlot(servicioIds, fecha);
    if (!entries.length) return;

    const entry = entries[0];
    const reservaUrl = `${clientBaseUrl(ctx.tenantSlug)}/reservar?servicios=${servicioIds.join(',')}`;

    const mensaje = `Hola ${entry.cliente_nombre ?? 'cliente'}! Se liberó un turno en ${fecha.toLocaleDateString('es-AR')} que coincide con tu lista de espera. Reservá acá (15 min): ${reservaUrl}`;

    await enqueueForTurno({
      tenantSlug: ctx.tenantSlug,
      turnoId,
      tipo: 'lista_espera',
      skipDuplicateCheck: true,
      customMessage: mensaje,
    });

    await listaEsperaRepo.markNotified(entry.id);
    logger.info('processWaitlist: notificado', { entryId: entry.id, turnoId });
  } catch (err) {
    logger.error('processWaitlist error', {
      turnoId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
