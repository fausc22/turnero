import * as politicasRepo from '../repositories/tenant/politicasRepository';
import * as servicioRepo from '../repositories/tenant/servicioRepository';
import * as horarioRepo from '../repositories/tenant/horarioOperativoRepository';
import * as bloqueoRepo from '../repositories/tenant/bloqueoRepository';
import * as turnoRepo from '../repositories/tenant/turnoRepository';
import * as profesionalRepo from '../repositories/tenant/profesionalRepository';
import * as tenantMetaRepo from '../repositories/tenant/tenantMetaRepository';
import { overlaps } from '../utils/overlap';
import { combineDateAndTime, addMinutes } from '../utils/timezone';
import { AppError } from '../utils/errors';

export interface DisponibilidadInput {
  fecha: string;
  servicioIds: number[];
  profesionalId?: number;
}

export interface Slot {
  fechaInicio: string;
  fechaFin: string;
  profesionalId: number | null;
  profesionalNombre?: string;
}

function getDayOfWeek(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

function timeToMinutes(hora: string): number {
  const [hh, mm] = hora.split(':').map(Number);
  return hh * 60 + mm;
}

function minutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
}

function isSlotFree(
  slotStart: Date,
  slotEnd: Date,
  turnos: { fecha_inicio: Date; fecha_fin: Date; profesional_id: number | null }[],
  bloqueos: { fecha_inicio: Date; fecha_fin: Date; profesional_id: number | null }[],
  profesionalId: number | null
): boolean {
  for (const t of turnos) {
    if (profesionalId != null && t.profesional_id != null && t.profesional_id !== profesionalId) {
      continue;
    }
    if (overlaps(slotStart, slotEnd, new Date(t.fecha_inicio), new Date(t.fecha_fin))) {
      return false;
    }
  }
  for (const b of bloqueos) {
    if (profesionalId != null && b.profesional_id != null && b.profesional_id !== profesionalId) {
      continue;
    }
    if (overlaps(slotStart, slotEnd, new Date(b.fecha_inicio), new Date(b.fecha_fin))) {
      return false;
    }
  }
  return true;
}

export async function getDisponibilidad(input: DisponibilidadInput): Promise<Slot[]> {
  const politicas = await politicasRepo.getPoliticas();
  if (!politicas) {
    throw new AppError(500, 'CONFIG_ERROR', 'Políticas de reserva no configuradas');
  }

  const servicios = await servicioRepo.findByIds(input.servicioIds);
  if (servicios.length !== input.servicioIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Uno o más servicios no existen o están inactivos');
  }

  const duracionTotal =
    servicios.reduce((sum, s) => sum + s.duracion_minutos, 0) + politicas.buffer_minutos;
  const diaSemana = getDayOfWeek(input.fecha);
  const meta = await tenantMetaRepo.getTenantMeta();
  const tz = meta?.timezone ?? 'America/Argentina/Buenos_Aires';

  const now = new Date();
  const minStart = addMinutes(now, politicas.anticipacion_minima_minutos);
  const maxStart = new Date(now);
  maxStart.setDate(maxStart.getDate() + politicas.anticipacion_maxima_dias);

  const dayStart = combineDateAndTime(input.fecha, '00:00:00', tz);
  const dayEnd = combineDateAndTime(input.fecha, '23:59:59', tz);
  const turnos = await turnoRepo.findTurnosEnRango(dayStart, dayEnd);
  const bloqueos = await bloqueoRepo.findOverlapping(dayStart, dayEnd);

  const granularidad = politicas.slot_granularidad_minutos;
  const slots: Slot[] = [];

  const tryAddSlot = (
    startMin: number,
    profesionalId: number | null,
    profesionalNombre?: string
  ) => {
    const horaInicio = minutesToTime(startMin);
    const slotStart = combineDateAndTime(input.fecha, horaInicio, tz);
    const slotEnd = addMinutes(slotStart, duracionTotal);

    if (slotStart < minStart || slotStart > maxStart) return;
    if (!isSlotFree(slotStart, slotEnd, turnos, bloqueos, profesionalId)) return;

    slots.push({
      fechaInicio: slotStart.toISOString(),
      fechaFin: slotEnd.toISOString(),
      profesionalId,
      profesionalNombre,
    });
  };

  if (input.profesionalId != null) {
    const pro = await profesionalRepo.findById(input.profesionalId);
    if (!pro) {
      throw new AppError(404, 'NOT_FOUND', 'Profesional no encontrado');
    }
    const horarios = await horarioRepo.findByDiaSemana(diaSemana, input.profesionalId);
    for (const h of horarios) {
      const startMin = timeToMinutes(h.hora_inicio);
      const endMin = timeToMinutes(h.hora_fin);
      for (let m = startMin; m + duracionTotal <= endMin; m += granularidad) {
        tryAddSlot(m, input.profesionalId, pro.nombre);
      }
    }
  } else {
    const profesionales = await profesionalRepo.listActivosForServicios(input.servicioIds);
    const horariosGenerales = await horarioRepo.findByDiaSemana(diaSemana);

    for (const h of horariosGenerales) {
      const startMin = timeToMinutes(h.hora_inicio);
      const endMin = timeToMinutes(h.hora_fin);
      for (let m = startMin; m + duracionTotal <= endMin; m += granularidad) {
        const horaInicio = minutesToTime(m);
        const slotStart = combineDateAndTime(input.fecha, horaInicio, tz);
        const slotEnd = addMinutes(slotStart, duracionTotal);

        if (slotStart < minStart || slotStart > maxStart) continue;

        const fit = profesionales.find((p) => {
          if (p.servicio_ids?.length && !input.servicioIds.every((sid) => p.servicio_ids!.includes(sid))) {
            return false;
          }
          return isSlotFree(slotStart, slotEnd, turnos, bloqueos, p.id);
        });

        if (fit) {
          slots.push({
            fechaInicio: slotStart.toISOString(),
            fechaFin: slotEnd.toISOString(),
            profesionalId: fit.id,
            profesionalNombre: fit.nombre,
          });
        }
      }
    }
  }

  slots.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  return slots;
}

export async function isSlotAvailable(
  fechaInicio: Date,
  servicioIds: number[],
  profesionalId: number | null
): Promise<{ available: boolean; profesionalId: number | null }> {
  const fecha = `${fechaInicio.getFullYear()}-${String(fechaInicio.getMonth() + 1).padStart(2, '0')}-${String(fechaInicio.getDate()).padStart(2, '0')}`;
  const slots = await getDisponibilidad({
    fecha,
    servicioIds,
    profesionalId: profesionalId ?? undefined,
  });

  const targetIso = fechaInicio.toISOString();
  const match = slots.find((s) => s.fechaInicio === targetIso || s.fechaInicio.slice(0, 16) === targetIso.slice(0, 16));
  if (match) {
    return { available: true, profesionalId: match.profesionalId };
  }

  const tolerance = 60_000;
  const found = slots.find((s) => {
    const diff = Math.abs(new Date(s.fechaInicio).getTime() - fechaInicio.getTime());
    return diff < tolerance;
  });

  return { available: !!found, profesionalId: found?.profesionalId ?? profesionalId };
}
