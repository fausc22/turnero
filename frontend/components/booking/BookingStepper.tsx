'use client';

import { cn } from '@/lib/utils';
import type { BookingStep } from '@/stores/bookingStore';

const STEPS = [
  { n: 1, label: 'Servicios' },
  { n: 2, label: 'Profesional' },
  { n: 3, label: 'Horario' },
  { n: 4, label: 'Datos' },
  { n: 5, label: 'Confirmar' },
] as const;

export function BookingStepper({ current }: { current: BookingStep }) {
  return (
    <nav aria-label="Pasos de reserva" className="mb-6">
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map(({ n, label }) => (
          <li key={n} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium',
                n === current
                  ? 'bg-primary text-primary-foreground'
                  : n < current
                    ? 'bg-primary/30 text-foreground'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {n}
            </span>
            <span className="hidden text-[10px] text-muted-foreground sm:block">{label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
