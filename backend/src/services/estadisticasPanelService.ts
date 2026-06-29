import { getTenantContext } from '../context/tenantContext';
import * as statsRepo from '../repositories/tenant/estadisticasRepository';

function parseRange(from: string, to: string): { from: Date; to: Date } {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    throw new Error('Rango de fechas inválido');
  }
  return { from: fromDate, to: toDate };
}

function hasAdvancedStats(): boolean {
  const ctx = getTenantContext();
  const features = ctx?.config?.features as Record<string, unknown> | undefined;
  if (features && 'estadisticas_avanzadas' in features) {
    return Boolean(features.estadisticas_avanzadas);
  }
  const plan = ctx?.plan ?? 'trial';
  return plan === 'profesional' || plan === 'enterprise';
}

export async function getResumen(fromStr: string, toStr: string) {
  const { from, to } = parseRange(fromStr, toStr);
  const advanced = hasAdvancedStats();

  const [
    byEstado,
    ingresos,
    clientesNuevos,
    clientesRecurrentes,
    turnosDia,
    ingresosDia,
    serviciosTop,
    horasPico,
  ] = await Promise.all([
    statsRepo.countTurnosByEstado(from, to),
    statsRepo.sumIngresos(from, to),
    statsRepo.countClientesNuevos(from, to),
    statsRepo.countClientesRecurrentes(from, to),
    statsRepo.turnosPorDia(from, to),
    advanced ? statsRepo.ingresosPorDia(from, to) : Promise.resolve([]),
    advanced ? statsRepo.serviciosTop(from, to, 5) : Promise.resolve([]),
    advanced ? statsRepo.horariosPico(from, to) : Promise.resolve([]),
  ]);

  const totalTurnos = Object.values(byEstado).reduce((s, n) => s + n, 0);
  const completados = byEstado.COMPLETADO ?? 0;
  const ticketPromedio = completados > 0 ? Math.round(ingresos / completados) : 0;
  const noShow = await statsRepo.noShowStats(from, to);

  return {
    totalTurnos,
    porEstado: byEstado,
    ingresos,
    ticketPromedio,
    clientesNuevos,
    clientesRecurrentes,
    tasaNoShow: noShow.tasa,
    turnosPorDia: turnosDia.map((r) => ({
      fecha: String(r.fecha).slice(0, 10),
      total: r.total,
    })),
    ingresosPorDia: ingresosDia.map((r) => ({
      fecha: String(r.fecha).slice(0, 10),
      total: Number(r.total),
    })),
    serviciosTop,
    horariosPico: horasPico,
    advanced,
  };
}

export async function getServiciosTop(fromStr: string, toStr: string, limit = 5) {
  const { from, to } = parseRange(fromStr, toStr);
  return statsRepo.serviciosTop(from, to, limit);
}

export async function getNoShows(fromStr: string, toStr: string) {
  const { from, to } = parseRange(fromStr, toStr);
  return statsRepo.noShowStats(from, to);
}
