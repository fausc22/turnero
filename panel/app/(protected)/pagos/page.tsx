'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchPagos } from '@/lib/tenant-api';
import { Badge } from '@/components/ui/badge';

const ESTADOS = ['', 'PAGADO', 'PENDIENTE', 'FALLIDO', 'DEVUELTO'];

export default function PagosPage() {
  const [estado, setEstado] = useState('');

  const { data: pagos = [], isLoading } = useQuery({
    queryKey: ['pagos', estado],
    queryFn: () => fetchPagos(estado ? { estado } : undefined),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pagos</h1>
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
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Turno</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-right">Monto</th>
              <th className="px-3 py-2 text-left">Ref. MP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-muted-foreground">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && pagos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-muted-foreground">
                  Sin pagos registrados
                </td>
              </tr>
            )}
            {pagos.map((p) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="px-3 py-2 whitespace-nowrap">
                  {format(new Date(p.creadoEn), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-3 py-2">{p.clienteNombre ?? '—'}</td>
                <td className="px-3 py-2">{p.turnoId ?? '—'}</td>
                <td className="px-3 py-2">
                  <Badge variant="outline">{p.estado}</Badge>
                </td>
                <td className="px-3 py-2 text-right">${p.monto}</td>
                <td className="px-3 py-2 font-mono text-xs">{p.referenciaExterna ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
