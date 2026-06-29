'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WeekDateStrip } from '@/components/booking/WeekDateStrip';
import { TimeSlotGrid } from '@/components/booking/TimeSlotGrid';
import { LandingSkeleton } from '@/components/layout/LoadingSkeleton';
import {
  useCancelarReserva,
  useDisponibilidad,
  useReservaByToken,
  useReprogramarReserva,
} from '@/hooks/public/usePublicQueries';
import { useTenant } from '@/context/TenantContext';
import { buildDateRange } from '@/lib/dates';
import { copy } from '@/lib/copy';
import { formatFechaHora, formatPrecio } from '@/lib/format';
import { getApiErrorCode } from '@/lib/api';
import type { Slot } from '@/types/public';

export function GestionarTurnoClient({ token }: { token: string }) {
  const { config } = useTenant();
  const { data: turno, isLoading, refetch } = useReservaByToken(token);
  const cancelar = useCancelarReserva();
  const reprogramar = useReprogramarReserva();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reprogMode, setReprogMode] = useState(false);
  const [fecha, setFecha] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);

  const maxDias = config?.politicas?.anticipacionMaximaDias ?? 30;
  const dates = buildDateRange(maxDias);
  const servicioIds = turno?.servicios.map((s) => s.servicioId) ?? [];

  const { data: slots = [], isLoading: loadingSlots } = useDisponibilidad(
    fecha,
    servicioIds,
    turno?.profesionalId ?? null,
    reprogMode && servicioIds.length > 0
  );

  if (isLoading) return <LandingSkeleton />;
  if (!turno) {
    return <p className="px-4 py-12 text-center text-muted-foreground">Turno no encontrado.</p>;
  }

  const cancelado = turno.estado === 'CANCELADO';

  const handleCancelar = async () => {
    try {
      await cancelar.mutateAsync(token);
      toast.success(copy.turnoCancelado);
      setCancelOpen(false);
      void refetch();
    } catch (err) {
      const code = getApiErrorCode(err);
      toast.error(
        code === 'CANCELATION_NOT_ALLOWED'
          ? 'No podés cancelar fuera de la ventana permitida.'
          : 'No pudimos cancelar el turno.'
      );
    }
  };

  const handleReprogramar = async () => {
    if (!slot) return;
    try {
      await reprogramar.mutateAsync({
        token,
        fechaInicio: slot.fechaInicio,
        profesionalId: slot.profesionalId,
      });
      toast.success('Turno reprogramado');
      setReprogMode(false);
      void refetch();
    } catch (err) {
      const code = getApiErrorCode(err);
      if (code === 'SLOT_TAKEN') toast.error(copy.slotOcupado);
      else if (code === 'REPROGRAM_LIMIT_EXCEEDED')
        toast.error('Alcanzaste el límite de reprogramaciones.');
      else toast.error('No pudimos reprogramar.');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <h1 className="text-xl font-semibold">{copy.gestionarTurno}</h1>
      <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
        <p>
          <span className="text-muted-foreground">Estado: </span>
          {turno.estado}
        </p>
        <p>
          <span className="text-muted-foreground">Fecha: </span>
          {formatFechaHora(turno.fechaInicio)}
        </p>
        <p>
          <span className="text-muted-foreground">Servicios: </span>
          {turno.servicios.map((s) => s.nombre).join(', ')}
        </p>
        <p>
          <span className="text-muted-foreground">Total: </span>
          {formatPrecio(turno.precioTotal)}
        </p>
      </div>

      {!cancelado && !reprogMode && (
        <div className="flex flex-col gap-3">
          <Button variant="destructive" onClick={() => setCancelOpen(true)}>
            {copy.cancelarTurno}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setReprogMode(true);
              setFecha(dates[0]?.value ?? null);
            }}
          >
            {copy.reprogramarTurno}
          </Button>
        </div>
      )}

      {reprogMode && (
        <div className="space-y-4">
          <WeekDateStrip dates={dates} selected={fecha} onSelect={setFecha} />
          <TimeSlotGrid
            slots={slots}
            selected={slot}
            onSelect={setSlot}
            isLoading={loadingSlots}
          />
          <Button
            className="w-full"
            disabled={!slot || reprogramar.isPending}
            onClick={() => void handleReprogramar()}
          >
            Confirmar nuevo horario
          </Button>
          <Button variant="ghost" onClick={() => setReprogMode(false)}>
            Cancelar
          </Button>
        </div>
      )}

      <Link href="/" className="inline-block text-sm text-muted-foreground hover:text-foreground">
        {copy.volverInicio}
      </Link>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar turno?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta acción libera el horario. No se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              disabled={cancelar.isPending}
              onClick={() => void handleCancelar()}
            >
              Confirmar cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
