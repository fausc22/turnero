'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchTurnos } from '@/lib/tenant-api';
import { TurnoDrawer } from '@/components/agenda/TurnoDrawer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ESTADO_STYLES } from '@/lib/agenda-utils';
import { cn } from '@/lib/utils';

const ESTADOS = ['', 'PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO', 'NO_ASISTIO'];

export default function TurnosPage() {
  const [from, setFrom] = useState('');
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  const { data: turnos = [], isLoading } = useQuery({
    queryKey: ['turnos', from, estado, search],
    queryFn: () =>
      fetchTurnos({
        ...(from ? { from: new Date(from).toISOString() } : {}),
        ...(estado ? { estado } : {}),
        ...(search ? { search } : {}),
        limit: 100,
      }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Turnos</h1>
      <div className="flex flex-wrap gap-2">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e || 'Todos los estados'}
            </option>
          ))}
        </select>
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Fecha</th>
              <th className="px-3 py-2 text-left font-medium">Cliente</th>
              <th className="px-3 py-2 text-left font-medium">Profesional</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
              <th className="px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-muted-foreground">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && turnos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-muted-foreground">
                  Sin turnos
                </td>
              </tr>
            )}
            {turnos.map((t) => (
              <tr
                key={t.id}
                className="cursor-pointer border-b border-border/50 hover:bg-muted/20"
                onClick={() => setSelected(t.id)}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  {format(new Date(t.fechaInicio), 'dd/MM HH:mm')}
                </td>
                <td className="px-3 py-2">{t.clienteNombre}</td>
                <td className="px-3 py-2 text-muted-foreground">{t.profesionalNombre ?? '—'}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className={cn('text-[10px]', ESTADO_STYLES[t.estado])}>
                    {t.estado}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">${t.precioTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TurnoDrawer turnoId={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
