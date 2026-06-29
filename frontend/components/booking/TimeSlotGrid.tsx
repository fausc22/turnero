'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/button';
import { copy } from '@/lib/copy';
import { formatHora } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Slot } from '@/types/public';

export function TimeSlotGrid({
  slots,
  selected,
  onSelect,
  isLoading,
}: {
  slots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    );
  }

  if (!slots.length) {
    return (
      <div className="space-y-3 text-center">
        <EmptyState title={copy.sinHorarios} />
        <Button variant="outline" size="sm" asChild>
          <Link href="/lista-espera">{copy.listaEspera}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selected?.fechaInicio === slot.fechaInicio;
        return (
          <button
            key={slot.fechaInicio}
            type="button"
            onClick={() => onSelect(slot)}
            className={cn(
              'rounded-lg border px-2 py-2 text-sm transition-colors',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-muted'
            )}
          >
            {formatHora(slot.fechaInicio)}
          </button>
        );
      })}
    </div>
  );
}
