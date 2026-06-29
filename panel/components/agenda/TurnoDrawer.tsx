'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchTurno, patchTurnoEstado, reenviarConfirmacionTurno } from '@/lib/tenant-api';
import { Skeleton } from '@/components/ui/skeleton';

interface TurnoDetalle {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteTelefono: string | null;
  clienteEmail?: string | null;
  profesionalNombre: string | null;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  precioTotal: number;
  notasCliente: string | null;
  servicios?: { nombre: string; precio: number }[];
}

const ACTIONS: Record<string, { label: string; estado: string }[]> = {
  PENDIENTE: [
    { label: 'Confirmar', estado: 'CONFIRMADO' },
    { label: 'Cancelar', estado: 'CANCELADO' },
  ],
  CONFIRMADO: [
    { label: 'Completar', estado: 'COMPLETADO' },
    { label: 'No asistió', estado: 'NO_ASISTIO' },
    { label: 'Cancelar', estado: 'CANCELADO' },
  ],
};

interface Props {
  turnoId: number | null;
  onClose: () => void;
}

export function TurnoDrawer({ turnoId, onClose }: Props) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['turno', turnoId],
    queryFn: () => fetchTurno(turnoId!) as Promise<TurnoDetalle>,
    enabled: turnoId != null,
  });

  const mutation = useMutation({
    mutationFn: (estado: string) => patchTurnoEstado(turnoId!, estado),
    onSuccess: () => {
      toast.success('Estado actualizado');
      void qc.invalidateQueries({ queryKey: ['agenda'] });
      void qc.invalidateQueries({ queryKey: ['turnos'] });
      void qc.invalidateQueries({ queryKey: ['turno', turnoId] });
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  });

  const reenviarMutation = useMutation({
    mutationFn: () => reenviarConfirmacionTurno(turnoId!),
    onSuccess: () => toast.success('Confirmación reenviada'),
    onError: () => toast.error('No se pudo reenviar la confirmación'),
  });

  const actions = data ? ACTIONS[data.estado] ?? [] : [];

  return (
    <Dialog open={turnoId != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle del turno</DialogTitle>
        </DialogHeader>
        {isLoading && <Skeleton className="h-32 w-full" />}
        {data && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{data.estado}</Badge>
              <span className="text-muted-foreground">#{data.id}</span>
            </div>
            <div>
              <p className="font-medium">{data.clienteNombre}</p>
              {data.clienteTelefono && <p className="text-muted-foreground">{data.clienteTelefono}</p>}
              <Link href={`/clientes/${data.clienteId}`} className="text-primary text-xs hover:underline">
                Ver ficha cliente
              </Link>
            </div>
            <div>
              <p>
                {format(new Date(data.fechaInicio), "EEEE d MMM · HH:mm", { locale: es })} –{' '}
                {format(new Date(data.fechaFin), 'HH:mm')}
              </p>
              {data.profesionalNombre && (
                <p className="text-muted-foreground">con {data.profesionalNombre}</p>
              )}
            </div>
            {data.servicios && data.servicios.length > 0 && (
              <ul className="space-y-1">
                {data.servicios.map((s, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{s.nombre}</span>
                    <span>${s.precio}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="font-medium">Total: ${data.precioTotal}</p>
            {data.notasCliente && (
              <p className="text-muted-foreground italic">{data.notasCliente}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {data.estado === 'CONFIRMADO' && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={reenviarMutation.isPending}
                  onClick={() => reenviarMutation.mutate()}
                >
                  Reenviar confirmación
                </Button>
              )}
              {actions.map((a) => (
                <Button
                  key={a.estado}
                  size="sm"
                  variant={a.estado === 'CANCELADO' ? 'outline' : 'default'}
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(a.estado)}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
