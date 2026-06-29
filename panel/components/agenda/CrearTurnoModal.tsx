'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createTurnoManual,
  fetchClientes,
  fetchProfesionales,
  fetchServicios,
  getApiErrorCode,
} from '@/lib/tenant-api';

interface SlotPrefill {
  profesionalId: number | null;
  fechaInicio: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: SlotPrefill | null;
}

export function CrearTurnoModal({ open, onClose, prefill }: Props) {
  const qc = useQueryClient();
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTel, setNuevoTel] = useState('');
  const [servicioIds, setServicioIds] = useState<number[]>([]);
  const [profesionalId, setProfesionalId] = useState<number | ''>(prefill?.profesionalId ?? '');
  const [fechaInicio, setFechaInicio] = useState(
    prefill?.fechaInicio ? prefill.fechaInicio.slice(0, 16) : ''
  );

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', clienteSearch],
    queryFn: () => fetchClientes(clienteSearch || undefined) as Promise<{ id: number; nombre: string; telefono: string }[]>,
    enabled: open,
  });
  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => fetchServicios() as Promise<{ id: number; nombre: string; activo: number }[]>,
    enabled: open,
  });
  const { data: profesionales = [] } = useQuery({
    queryKey: ['profesionales'],
    queryFn: () => fetchProfesionales() as Promise<{ id: number; nombre: string; activo: number }[]>,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        servicioIds,
        fechaInicio: new Date(fechaInicio).toISOString(),
        profesionalId: profesionalId === '' ? null : profesionalId,
      };
      if (clienteId) body.clienteId = clienteId;
      else body.cliente = { nombre: nuevoNombre, telefono: nuevoTel };
      return createTurnoManual(body);
    },
    onSuccess: () => {
      toast.success('Turno creado');
      void qc.invalidateQueries({ queryKey: ['agenda'] });
      void qc.invalidateQueries({ queryKey: ['turnos'] });
      onClose();
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      toast.error(code === 'SLOT_TAKEN' ? 'Horario no disponible' : 'Error al crear turno');
    },
  });

  function toggleServicio(id: number) {
    setServicioIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const canSubmit =
    servicioIds.length > 0 &&
    fechaInicio &&
    (clienteId || (nuevoNombre.length >= 2 && nuevoTel.length >= 8));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo turno</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Buscar cliente</Label>
            <Input value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)} placeholder="Nombre o teléfono" />
            {clientes.length > 0 && (
              <ul className="mt-1 max-h-24 overflow-auto rounded border border-border text-sm">
                {clientes.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`w-full px-2 py-1 text-left hover:bg-muted ${clienteId === c.id ? 'bg-primary/20' : ''}`}
                      onClick={() => {
                        setClienteId(c.id);
                        setClienteSearch(c.nombre);
                      }}
                    >
                      {c.nombre} · {c.telefono}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {!clienteId && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label>Nombre nuevo</Label>
                <Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={nuevoTel} onChange={(e) => setNuevoTel(e.target.value)} />
              </div>
            </div>
          )}
          <div>
            <Label>Servicios</Label>
            <div className="mt-1 flex flex-wrap gap-1">
              {servicios
                .filter((s) => s.activo)
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleServicio(s.id)}
                    className={`rounded border px-2 py-0.5 text-xs ${servicioIds.includes(s.id) ? 'border-primary bg-primary/20' : 'border-border'}`}
                  >
                    {s.nombre}
                  </button>
                ))}
            </div>
          </div>
          <div>
            <Label>Profesional</Label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={profesionalId}
              onChange={(e) => setProfesionalId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Sin asignar</option>
              {profesionales
                .filter((p) => p.activo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label>Fecha y hora</Label>
            <Input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
            Crear turno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
