'use client';

import { cn } from '@/lib/utils';

export function WeekDateStrip({
  dates,
  selected,
  onSelect,
}: {
  dates: { value: string; label: string }[];
  selected: string | null;
  onSelect: (fecha: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      {dates.map((d) => (
        <button
          key={d.value}
          type="button"
          onClick={() => onSelect(d.value)}
          className={cn(
            'min-w-[4.5rem] shrink-0 rounded-lg border px-3 py-2 text-center text-sm transition-colors',
            selected === d.value
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card hover:bg-muted'
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
