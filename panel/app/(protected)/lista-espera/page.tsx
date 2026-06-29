'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchListaEspera, removeListaEspera } from '@/lib/tenant-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getApiErrorCode } from '@/lib/tenant-api';

export default function ListaEsperaPage() {
  const qc = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['lista-espera'],
    queryFn: fetchListaEspera,
    retry: false,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => removeListaEspera(id),
    onSuccess: () => {
      toast.success('Entrada eliminada');
      void qc.invalidateQueries({ queryKey: ['lista-espera'] });
    },
    onError: () => toast.error('Error al eliminar'),
  });

  const featureOff = getApiErrorCode(error) === 'FEATURE_NOT_AVAILABLE';

  if (featureOff) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Lista de espera</h1>
        <p className="text-muted-foreground">No disponible en tu plan actual.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Lista de espera</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-3 py-2 text-left">Cliente</th>
                <th className="px-3 py-2 text-left">Teléfono</th>
                <th className="px-3 py-2 text-left">Servicios</th>
                <th className="px-3 py-2 text-left">Período</th>
                <th className="px-3 py-2 text-left">Notificado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="px-3 py-2">{item.clienteNombre}</td>
                  <td className="px-3 py-2">{item.clienteTelefono ?? '—'}</td>
                  <td className="px-3 py-2">
                    {item.servicios.map((s) => s.nombre).join(', ')}
                  </td>
                  <td className="px-3 py-2">
                    {item.fechaDesde} — {item.fechaHasta}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={item.notificado ? 'default' : 'secondary'}>
                      {item.notificado ? 'Sí' : 'No'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMutation.mutate(item.id)}
                    >
                      Quitar
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    Sin entradas en lista de espera
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
