'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  addDays,
  format,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { TurnoListItem } from '@/lib/tenant-api';
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  SLOT_MINUTES,
  totalSlots,
  turnoSpanSlots,
} from '@/lib/agenda-utils';
import { TurnoBlock } from './TurnoBlock';
import { cn } from '@/lib/utils';

interface ProfesionalCol {
  id: number;
  nombre: string;
}

interface Props {
  fecha: string;
  profesionales: ProfesionalCol[];
  turnos: TurnoListItem[];
  onTurnoClick: (id: number) => void;
  onSlotClick: (profesionalId: number | null, fechaInicio: string) => void;
}

function DroppableSlot({
  id,
  profId,
  slotIndex,
  dayStart,
  onSlotClick,
}: {
  id: string;
  profId: number | null;
  slotIndex: number;
  dayStart: Date;
  onSlotClick: (profesionalId: number | null, fechaInicio: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { profId, slotIndex, dayStart } });
  const slotDate = new Date(dayStart.getTime() + slotIndex * SLOT_MINUTES * 60000);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-b border-border/30 min-h-[14px]',
        isOver && 'bg-primary/10'
      )}
      onClick={() => onSlotClick(profId, slotDate.toISOString())}
      role="presentation"
    />
  );
}

export function AgendaDayGrid({ fecha, profesionales, turnos, onTurnoClick, onSlotClick }: Props) {
  const day = parseISO(fecha);
  const dayStart = setMinutes(setHours(startOfDay(day), DAY_START_HOUR), 0);
  const slots = totalSlots();
  const cols = profesionales.length > 0 ? profesionales : [{ id: 0, nombre: 'Sin asignar' }];

  const timeLabels = Array.from({ length: slots }, (_, i) => {
    const t = new Date(dayStart.getTime() + i * SLOT_MINUTES * 60000);
    return i % 4 === 0 ? format(t, 'HH:mm', { locale: es }) : '';
  });

  return (
    <div className="overflow-auto rounded-lg border border-border">
      <div
        className="grid min-w-[640px]"
        style={{
          gridTemplateColumns: `56px repeat(${cols.length}, minmax(120px, 1fr))`,
          gridTemplateRows: `32px repeat(${slots}, 14px)`,
        }}
      >
        <div className="sticky left-0 z-10 border-b border-r border-border bg-card p-2 text-xs text-muted-foreground">
          Hora
        </div>
        {cols.map((p) => (
          <div
            key={p.id}
            className="sticky top-0 z-10 border-b border-r border-border bg-card p-2 text-center text-xs font-medium truncate"
          >
            {p.nombre}
          </div>
        ))}

        {timeLabels.map((label, i) => (
          <div
            key={`t-${i}`}
            className="sticky left-0 z-10 border-r border-border bg-card px-1 text-[10px] text-muted-foreground"
            style={{ gridRow: i + 2, gridColumn: 1 }}
          >
            {label}
          </div>
        ))}

        {cols.map((p, colIdx) => {
          const profId = p.id === 0 ? null : p.id;
          const colTurnos = turnos.filter((t) =>
            profId == null ? t.profesionalId == null : t.profesionalId === profId
          );

          return (
            <div
              key={p.id}
              className="relative border-r border-border"
              style={{ gridColumn: colIdx + 2, gridRow: `2 / span ${slots}` }}
            >
              <div
                className="grid h-full"
                style={{ gridTemplateRows: `repeat(${slots}, 14px)` }}
              >
                {Array.from({ length: slots }, (_, slotIndex) => (
                  <DroppableSlot
                    key={slotIndex}
                    id={`slot-${profId ?? 'null'}-${slotIndex}`}
                    profId={profId}
                    slotIndex={slotIndex}
                    dayStart={dayStart}
                    onSlotClick={onSlotClick}
                  />
                ))}
              </div>
              <div
                className="pointer-events-none absolute inset-0 grid"
                style={{ gridTemplateRows: `repeat(${slots}, 14px)` }}
              >
                {colTurnos.map((turno) => {
                  const { start, span } = turnoSpanSlots(turno, dayStart);
                  return (
                    <div key={turno.id} className="pointer-events-auto" style={{ display: 'contents' }}>
                      <TurnoBlock
                        turno={turno}
                        gridRowStart={start + 1}
                        gridRowSpan={span}
                        onClick={() => onTurnoClick(turno.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function weekRange(fecha: string): string[] {
  const start = startOfDay(parseISO(fecha));
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
}
