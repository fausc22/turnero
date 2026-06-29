'use client';

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TurnoListItem } from '@/lib/tenant-api';
import { ESTADO_STYLES } from '@/lib/agenda-utils';
import { cn } from '@/lib/utils';
import { weekRange } from './AgendaDayGrid';

interface Props {
  fecha: string;
  turnos: TurnoListItem[];
  onTurnoClick: (id: number) => void;
}

export function AgendaWeekGrid({ fecha, turnos, onTurnoClick }: Props) {
  const days = weekRange(fecha);

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((day) => {
        const dayTurnos = turnos.filter(
          (t) => format(new Date(t.fechaInicio), 'yyyy-MM-dd') === day
        );
        return (
          <div key={day} className="rounded-lg border border-border p-2">
            <p className="mb-2 text-xs font-medium capitalize">
              {format(parseISO(day), 'EEE d MMM', { locale: es })}
            </p>
            <div className="space-y-1">
              {dayTurnos.length === 0 && (
                <p className="text-[10px] text-muted-foreground">Sin turnos</p>
              )}
              {dayTurnos.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTurnoClick(t.id)}
                  className={cn(
                    'w-full rounded border px-2 py-1 text-left text-[10px]',
                    ESTADO_STYLES[t.estado]
                  )}
                >
                  <span className="font-medium">{format(new Date(t.fechaInicio), 'HH:mm')}</span>{' '}
                  {t.clienteNombre}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
