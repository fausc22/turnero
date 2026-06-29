'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDuracion, formatPrecio } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ServicioPublico } from '@/types/public';

export function ServiceCard({
  servicio,
  selected,
  onToggle,
}: {
  servicio: ServicioPublico;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors',
        selected && 'border-primary ring-1 ring-primary'
      )}
      onClick={onToggle}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox checked={selected} onCheckedChange={onToggle} aria-label={servicio.nombre} />
        <div className="flex-1">
          <p className="font-medium">{servicio.nombre}</p>
          {servicio.descripcion && (
            <p className="mt-1 text-sm text-muted-foreground">{servicio.descripcion}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDuracion(servicio.duracionMinutos)} · {formatPrecio(servicio.precio)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
