'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TurnoListItem } from '@/lib/tenant-api';
import { ESTADO_STYLES } from '@/lib/agenda-utils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  turno: TurnoListItem;
  gridRowStart: number;
  gridRowSpan: number;
  onClick: () => void;
}

export function TurnoBlock({ turno, gridRowStart, gridRowSpan, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `turno-${turno.id}`,
    data: { turno },
  });

  const style = {
    gridRow: `${gridRowStart} / span ${gridRowSpan}`,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      className={cn(
        'm-0.5 rounded border px-1 py-0.5 text-left text-[10px] leading-tight transition-shadow hover:shadow-md',
        ESTADO_STYLES[turno.estado] ?? ESTADO_STYLES.CONFIRMADO
      )}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <span className="block font-medium truncate">{turno.clienteNombre}</span>
      <span className="block opacity-80">
        {format(new Date(turno.fechaInicio), 'HH:mm', { locale: es })}
      </span>
    </button>
  );
}
