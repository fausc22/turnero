'use client';

import { Button } from '@/components/ui/button';
import { formatDuracion, formatPrecio } from '@/lib/format';
import { copy } from '@/lib/copy';
import type { ServicioPublico } from '@/types/public';

export function StickyBookingSummary({
  servicios,
  selectedIds,
  onContinue,
  canContinue,
  continueLabel = copy.continuar,
}: {
  servicios: ServicioPublico[];
  selectedIds: number[];
  onContinue?: () => void;
  canContinue: boolean;
  continueLabel?: string;
}) {
  const selected = servicios.filter((s) => selectedIds.includes(s.id));
  const totalPrecio = selected.reduce((sum, s) => sum + s.precio, 0);
  const totalDuracion = selected.reduce((sum, s) => sum + s.duracionMinutos, 0);

  if (!selectedIds.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[var(--bg-elevated)]/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div className="text-sm">
          <p className="font-medium">{formatPrecio(totalPrecio)}</p>
          <p className="text-muted-foreground">{formatDuracion(totalDuracion)}</p>
        </div>
        {onContinue && (
          <Button onClick={onContinue} disabled={!canContinue}>
            {continueLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
