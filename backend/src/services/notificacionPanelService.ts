import fs from 'fs';
import path from 'path';
import { findTenantBySlug, updateTenant } from '../repositories/admin/tenantRepository';
import { getTenantContext } from '../context/tenantContext';
import * as plantillaRepo from '../repositories/tenant/plantillaNotificacionRepository';
import * as waStatusRepo from '../repositories/admin/whatsappSessionStatusRepository';
import { reenviarConfirmacion } from './turnoNotificationHooks';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import { AppError, NotFoundError } from '../utils/errors';
import type { TenantConfigJson } from '../types/tenant';

const BAILEYS_DIR = path.join(__dirname, '../../.baileys');
const RECONNECT_FLAG = path.join(BAILEYS_DIR, '.reconnect');

export async function listPlantillas() {
  const rows = await plantillaRepo.listAll();
  return rows.map((r) => ({
    tipo: r.tipo,
    canal: r.canal,
    cuerpo: r.cuerpo,
  }));
}

export async function updatePlantilla(tipo: plantillaRepo.PlantillaTipo, canal: plantillaRepo.PlantillaCanal, cuerpo: string) {
  await plantillaRepo.upsert(tipo, canal, cuerpo);
  return { tipo, canal };
}

export async function getWhatsappStatus() {
  return waStatusRepo.getStatus();
}

export async function requestWhatsappReconnect() {
  if (!fs.existsSync(BAILEYS_DIR)) {
    fs.mkdirSync(BAILEYS_DIR, { recursive: true });
  }
  fs.writeFileSync(RECONNECT_FLAG, String(Date.now()));
  return { ok: true, message: 'Señal de reconexión enviada al worker' };
}

export async function getNotificationFeatures() {
  const ctx = getTenantContext();
  const features = (ctx?.config?.features ?? {}) as Record<string, unknown>;
  return {
    recordatorio24h: features.recordatorio_24h !== false,
    recordatorio2h: Boolean(features.recordatorio_2h),
  };
}

export async function updateNotificationFeatures(input: {
  recordatorio24h?: boolean;
  recordatorio2h?: boolean;
}) {
  const ctx = getTenantContext();
  if (!ctx) throw new AppError(500, 'NO_CONTEXT', 'Sin contexto de tenant');

  const tenant = await findTenantBySlug(ctx.tenantSlug);
  if (!tenant) throw new NotFoundError('Tenant');

  const config = { ...(tenant.config_json ?? {}) } as TenantConfigJson;
  const features = { ...(config.features ?? {}) } as Record<string, unknown>;

  if (input.recordatorio24h !== undefined) features.recordatorio_24h = input.recordatorio24h;
  if (input.recordatorio2h !== undefined) features.recordatorio_2h = input.recordatorio2h;

  config.features = features;
  await updateTenant(tenant.id, { config_json: config as Record<string, unknown> });

  return {
    recordatorio24h: features.recordatorio_24h !== false,
    recordatorio2h: Boolean(features.recordatorio_2h),
  };
}

export async function reenviarConfirmacionTurno(turnoId: number) {
  const turno = await turnoRepo.findById(turnoId);
  if (!turno) throw new NotFoundError('Turno');
  if (turno.estado !== 'CONFIRMADO') {
    throw new AppError(400, 'INVALID_STATE', 'Solo se puede reenviar confirmación de turnos CONFIRMADO');
  }
  await reenviarConfirmacion(turnoId);
  return { ok: true };
}
