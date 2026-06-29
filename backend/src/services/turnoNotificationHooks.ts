import { enqueueForTurno } from './notificationEnqueueService';
import { getTenantContext } from '../context/tenantContext';
import logger from '../config/logger';

export async function onTurnoConfirmado(turnoId: number): Promise<void> {
  const ctx = getTenantContext();
  if (!ctx) return;
  try {
    await enqueueForTurno({
      tenantSlug: ctx.tenantSlug,
      turnoId,
      tipo: 'confirmacion',
    });
  } catch (err) {
    logger.error('onTurnoConfirmado', {
      turnoId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function onTurnoCancelado(turnoId: number): Promise<void> {
  const ctx = getTenantContext();
  if (!ctx) return;
  try {
    await enqueueForTurno({
      tenantSlug: ctx.tenantSlug,
      turnoId,
      tipo: 'cancelacion',
    });
  } catch (err) {
    logger.error('onTurnoCancelado', {
      turnoId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function reenviarConfirmacion(turnoId: number): Promise<void> {
  const ctx = getTenantContext();
  if (!ctx) return;
  await enqueueForTurno({
    tenantSlug: ctx.tenantSlug,
    turnoId,
    tipo: 'confirmacion_reenvio',
    skipDuplicateCheck: true,
  });
}
