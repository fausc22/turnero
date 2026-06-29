import { getTenantContext } from '../context/tenantContext';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as profesionalRepo from '../repositories/tenant/profesionalRepository';
import * as usuarioRepo from '../repositories/tenant/usuarioRepository';
import { AppError } from '../utils/errors';
import type { TenantPlan } from '../types/tenant';

const PLAN_PROFESIONALES: Record<TenantPlan, number | null> = {
  trial: 1,
  basico: 2,
  profesional: 10,
  enterprise: null,
};

const PLAN_USUARIOS: Record<TenantPlan, number | null> = {
  trial: 1,
  basico: 3,
  profesional: 10,
  enterprise: null,
};

const PLAN_TURNOS_MES: Record<TenantPlan, number | null> = {
  trial: 100,
  basico: 500,
  profesional: null,
  enterprise: null,
};

function isUnlimited(): boolean {
  return process.env.DEV_UNLIMITED === 'true';
}

function getFeatures(): Record<string, unknown> {
  const ctx = getTenantContext();
  return (ctx?.config?.features as Record<string, unknown>) ?? {};
}

export function getMaxProfesionales(plan: TenantPlan, config?: Record<string, unknown>): number | null {
  if (isUnlimited()) return null;
  const features = (config?.features as Record<string, unknown>) ?? getFeatures();
  if (typeof features.max_profesionales === 'number') return features.max_profesionales;
  return PLAN_PROFESIONALES[plan];
}

export function getMaxUsuariosPanel(plan: TenantPlan, config?: Record<string, unknown>): number | null {
  if (isUnlimited()) return null;
  const features = (config?.features as Record<string, unknown>) ?? getFeatures();
  if (typeof features.max_usuarios_panel === 'number') return features.max_usuarios_panel;
  return PLAN_USUARIOS[plan];
}

export function getMaxTurnosMes(plan: TenantPlan, config?: Record<string, unknown>): number | null {
  if (isUnlimited()) return null;
  const features = (config?.features as Record<string, unknown>) ?? getFeatures();
  if (typeof features.max_turnos_mes === 'number') return features.max_turnos_mes;
  return PLAN_TURNOS_MES[plan];
}

export function assertFeatureEnabled(featureKey: string): void {
  const features = getFeatures();
  if (!features[featureKey]) {
    throw new AppError(403, 'FEATURE_NOT_AVAILABLE', `Feature "${featureKey}" no disponible en este plan`);
  }
}

export async function assertCanCreateProfesional(): Promise<void> {
  const ctx = getTenantContext();
  if (!ctx) return;
  const max = getMaxProfesionales(ctx.plan, ctx.config as Record<string, unknown>);
  if (max == null) return;
  const count = await profesionalRepo.countActivos();
  if (count >= max) {
    throw new AppError(403, 'PLAN_LIMIT_PROFESIONALES', 'Límite de profesionales alcanzado', {
      max,
      current: count,
    });
  }
}

export async function assertCanCreateUsuario(): Promise<void> {
  const ctx = getTenantContext();
  if (!ctx) return;
  const max = getMaxUsuariosPanel(ctx.plan, ctx.config as Record<string, unknown>);
  if (max == null) return;
  const count = await usuarioRepo.countActivos();
  if (count >= max) {
    throw new AppError(403, 'PLAN_LIMIT_USUARIOS', 'Límite de usuarios del panel alcanzado', {
      max,
      current: count,
    });
  }
}

export async function assertCanCreateTurno(): Promise<void> {
  const ctx = getTenantContext();
  if (!ctx) return;
  const max = getMaxTurnosMes(ctx.plan, ctx.config as Record<string, unknown>);
  if (max == null) return;
  const now = new Date();
  const count = await turnoRepo.countTurnosMes(now.getFullYear(), now.getMonth() + 1);
  if (count >= max) {
    throw new AppError(403, 'PLAN_LIMIT_TURNOS', 'Límite mensual de turnos alcanzado', {
      max,
      current: count,
    });
  }
}
