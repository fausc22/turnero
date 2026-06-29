'use client';

import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { copy } from '@/lib/copy';
import { cn } from '@/lib/utils';
import type { ProfesionalPublico } from '@/types/public';

export function ProfessionalPicker({
  profesionales,
  servicioIds,
  value,
  onChange,
}: {
  profesionales: ProfesionalPublico[];
  servicioIds: number[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const filtered = profesionales.filter((p) => {
    if (!p.servicioIds.length) return true;
    return servicioIds.every((sid) => p.servicioIds.includes(sid));
  });

  const radioValue = value === null ? 'any' : String(value);

  return (
    <RadioGroup
      value={radioValue}
      onValueChange={(v) => onChange(v === 'any' ? null : parseInt(v, 10))}
      className="space-y-3"
    >
      <Card
        className={cn('cursor-pointer', radioValue === 'any' && 'border-primary ring-1 ring-primary')}
        onClick={() => onChange(null)}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <RadioGroupItem value="any" id="pro-any" />
          <Label htmlFor="pro-any" className="cursor-pointer font-medium">
            {copy.cualquiera}
          </Label>
        </CardContent>
      </Card>
      {filtered.map((p) => (
        <Card
          key={p.id}
          className={cn(
            'cursor-pointer',
            radioValue === String(p.id) && 'border-primary ring-1 ring-primary'
          )}
          onClick={() => onChange(p.id)}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <RadioGroupItem value={String(p.id)} id={`pro-${p.id}`} />
            <div>
              <Label htmlFor={`pro-${p.id}`} className="cursor-pointer font-medium">
                {p.nombre}
              </Label>
              {p.especialidad && (
                <p className="text-sm text-muted-foreground">{p.especialidad}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </RadioGroup>
  );
}
