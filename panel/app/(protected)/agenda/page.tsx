'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useQueryState, parseAsString, parseAsStringLiteral } from 'nuqs';
import {
  addDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AgendaDayGrid } from '@/components/agenda/AgendaDayGrid';
import { AgendaWeekGrid } from '@/components/agenda/AgendaWeekGrid';
import { TurnoDrawer } from '@/components/agenda/TurnoDrawer';
import { CrearTurnoModal } from '@/components/agenda/CrearTurnoModal';
import {
  fetchAgenda,
  fetchMe,
  fetchProfesionales,
  reprogramarTurno,
  getApiErrorCode,
  type TurnoListItem,
} from '@/lib/tenant-api';
import { SLOT_MINUTES } from '@/lib/agenda-utils';
import { useAuth } from '@/context/AuthContext';

export default function AgendaPage() {
  const { usuario } = useAuth();
  const qc = useQueryClient();
  const [vista, setVista] = useQueryState('vista', parseAsStringLiteral(['day', 'week'] as const).withDefault('day'));
  const [fecha, setFecha] = useQueryState('fecha', parseAsString.withDefault(format(new Date(), 'yyyy-MM-dd')));
  const [profesionalId, setProfesionalId] = useQueryState('profesionalId', parseAsString);
  const [selectedTurno, setSelectedTurno] = useState<number | null>(null);
  const [crearOpen, setCrearOpen] = useState(false);
  const [slotPrefill, setSlotPrefill] = useState<{ profesionalId: number | null; fechaInicio: string } | null>(null);

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const lockedProf = usuario?.rol === 'PROFESIONAL' ? me?.profesionalId : undefined;
  const profFilter = lockedProf ?? (profesionalId ? Number(profesionalId) : undefined);

  const day = parseISO(fecha);
  const from =
    vista === 'day'
      ? startOfDay(day).toISOString()
      : startOfWeek(day, { weekStartsOn: 1 }).toISOString();
  const to =
    vista === 'day'
      ? endOfDay(day).toISOString()
      : endOfWeek(day, { weekStartsOn: 1 }).toISOString();

  const { data: agenda, isLoading } = useQuery({
    queryKey: ['agenda', from, to, profFilter],
    queryFn: () => fetchAgenda({ from, to, profesionalId: profFilter }),
  });

  const { data: profesionales = [] } = useQuery({
    queryKey: ['profesionales'],
    queryFn: () =>
      fetchProfesionales() as Promise<{ id: number; nombre: string; activo: number }[]>,
  });

  const activeProfs = profesionales
    .filter((p) => p.activo)
    .filter((p) => (profFilter ? p.id === profFilter : true))
    .map((p) => ({ id: p.id, nombre: p.nombre }));

  const reprogramar = useMutation({
    mutationFn: ({ id, fechaInicio, profesionalId: pid }: { id: number; fechaInicio: string; profesionalId: number | null }) =>
      reprogramarTurno(id, { fechaInicio, profesionalId: pid }),
    onSuccess: () => {
      toast.success('Turno reprogramado');
      void qc.invalidateQueries({ queryKey: ['agenda'] });
    },
    onError: (err) => {
      const code = getApiErrorCode(err);
      toast.error(code === 'SLOT_TAKEN' ? 'Horario no disponible' : 'No se pudo reprogramar');
      void qc.invalidateQueries({ queryKey: ['agenda'] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function shiftDate(delta: number) {
    void setFecha(format(addDays(parseISO(fecha), delta), 'yyyy-MM-dd'));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const turno = active.data.current?.turno as TurnoListItem | undefined;
    const drop = over.data.current as { profId: number | null; slotIndex: number; dayStart: Date } | undefined;
    if (!turno || !drop) return;

    const newStart = new Date(drop.dayStart.getTime() + drop.slotIndex * SLOT_MINUTES * 60000);
    reprogramar.mutate({
      id: turno.id,
      fechaInicio: newStart.toISOString(),
      profesionalId: drop.profId,
    });
  }

  function openCrearSlot(profesionalId: number | null, fechaInicio: string) {
    setSlotPrefill({ profesionalId, fechaInicio });
    setCrearOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {format(parseISO(fecha), vista === 'day' ? "EEEE d 'de' MMMM" : "'Semana del' d MMM", {
              locale: es,
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border">
            <Button
              size="sm"
              variant={vista === 'day' ? 'default' : 'ghost'}
              onClick={() => void setVista('day')}
            >
              Día
            </Button>
            <Button
              size="sm"
              variant={vista === 'week' ? 'default' : 'ghost'}
              onClick={() => void setVista('week')}
            >
              Semana
            </Button>
          </div>
          <Button size="icon" variant="outline" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => void setFecha(format(new Date(), 'yyyy-MM-dd'))}>
            Hoy
          </Button>
          <Button size="icon" variant="outline" onClick={() => shiftDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {usuario?.rol !== 'PROFESIONAL' && (
            <select
              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              value={profesionalId ?? ''}
              onChange={(e) => void setProfesionalId(e.target.value || null)}
            >
              <option value="">Todos los profesionales</option>
              {profesionales
                .filter((p) => p.activo)
                .map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </option>
                ))}
            </select>
          )}
          <Button onClick={() => { setSlotPrefill(null); setCrearOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando agenda...</p>}

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {vista === 'day' && agenda && (
          <AgendaDayGrid
            fecha={fecha}
            profesionales={activeProfs}
            turnos={agenda.turnos}
            onTurnoClick={setSelectedTurno}
            onSlotClick={openCrearSlot}
          />
        )}
        {vista === 'week' && agenda && (
          <AgendaWeekGrid
            fecha={fecha}
            turnos={agenda.turnos}
            onTurnoClick={setSelectedTurno}
          />
        )}
      </DndContext>

      <TurnoDrawer turnoId={selectedTurno} onClose={() => setSelectedTurno(null)} />
      <CrearTurnoModal open={crearOpen} onClose={() => setCrearOpen(false)} prefill={slotPrefill} />
    </div>
  );
}
