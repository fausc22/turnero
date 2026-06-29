import type { TurnoListItem } from './tenant-api';

export const SLOT_MINUTES = 15;
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 21;

export const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
  CONFIRMADO: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
  COMPLETADO: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  CANCELADO: 'bg-neutral-500/20 border-neutral-500/50 text-neutral-400 line-through',
  NO_ASISTIO: 'bg-red-500/20 border-red-500/50 text-red-200',
};

export function slotIndexFromDate(iso: string, dayStart: Date): number {
  const d = new Date(iso);
  const minutes = (d.getTime() - dayStart.getTime()) / 60000;
  return Math.floor(minutes / SLOT_MINUTES);
}

export function dateFromSlotIndex(dayStart: Date, index: number): Date {
  return new Date(dayStart.getTime() + index * SLOT_MINUTES * 60000);
}

export function turnoSpanSlots(turno: TurnoListItem, dayStart: Date): { start: number; span: number } {
  const start = slotIndexFromDate(turno.fechaInicio, dayStart);
  const end = slotIndexFromDate(turno.fechaFin, dayStart);
  return { start: Math.max(0, start), span: Math.max(1, end - start) };
}

export function totalSlots(): number {
  return ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;
}
