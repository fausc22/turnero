'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchHorarios, saveHorariosDia, fetchBloqueos, createBloqueo, deleteBloqueo } from '@/lib/tenant-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface Franja {
  id?: number;
  horaInicio: string;
  horaFin: string;
}

interface HorarioRow {
  id: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

interface Bloqueo {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  motivo: string | null;
}

export default function HorariosPage() {
  const qc = useQueryClient();
  const [selectedDia, setSelectedDia] = useState(1);
  const [franjas, setFranjas] = useState<Franja[]>([{ horaInicio: '09:00', horaFin: '18:00' }]);
  const [bloqueoInicio, setBloqueoInicio] = useState('');
  const [bloqueoFin, setBloqueoFin] = useState('');
  const [bloqueoMotivo, setBloqueoMotivo] = useState('');

  const { data: horarios = [] } = useQuery({
    queryKey: ['horarios'],
    queryFn: () => fetchHorarios() as Promise<HorarioRow[]>,
  });

  const { data: bloqueos = [] } = useQuery({
    queryKey: ['bloqueos'],
    queryFn: () => fetchBloqueos() as Promise<Bloqueo[]>,
  });

  useEffect(() => {
    if (horarios.length >= 0) loadDia(selectedDia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horarios]);

  function loadDia(dia: number) {
    setSelectedDia(dia);
    const dayRows = horarios.filter((x) => x.diaSemana === dia);
    setFranjas(
      dayRows.length > 0
        ? dayRows.map((r) => ({ horaInicio: r.horaInicio.slice(0, 5), horaFin: r.horaFin.slice(0, 5) }))
        : [{ horaInicio: '09:00', horaFin: '18:00' }]
    );
  }

  const saveMutation = useMutation({
    mutationFn: () => saveHorariosDia(selectedDia, franjas),
    onSuccess: () => {
      toast.success('Horarios guardados');
      void qc.invalidateQueries({ queryKey: ['horarios'] });
    },
    onError: () => toast.error('Error al guardar'),
  });

  const bloqueoMutation = useMutation({
    mutationFn: () =>
      createBloqueo({
        fechaInicio: new Date(bloqueoInicio).toISOString(),
        fechaFin: new Date(bloqueoFin).toISOString(),
        motivo: bloqueoMotivo || undefined,
      }),
    onSuccess: () => {
      toast.success('Bloqueo creado');
      void qc.invalidateQueries({ queryKey: ['bloqueos'] });
      setBloqueoInicio('');
      setBloqueoFin('');
      setBloqueoMotivo('');
    },
    onError: () => toast.error('Error'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Horarios operativos</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Semana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {DIAS.map((label, i) => {
              const dia = i + 1;
              return (
                <Button
                  key={dia}
                  size="sm"
                  variant={selectedDia === dia ? 'default' : 'outline'}
                  onClick={() => loadDia(dia)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
          <div className="space-y-2">
            {franjas.map((f, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2">
                <Input
                  type="time"
                  value={f.horaInicio}
                  onChange={(e) => {
                    const next = [...franjas];
                    next[idx] = { ...f, horaInicio: e.target.value };
                    setFranjas(next);
                  }}
                  className="w-auto"
                />
                <span className="text-muted-foreground">a</span>
                <Input
                  type="time"
                  value={f.horaFin}
                  onChange={(e) => {
                    const next = [...franjas];
                    next[idx] = { ...f, horaFin: e.target.value };
                    setFranjas(next);
                  }}
                  className="w-auto"
                />
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => setFranjas([...franjas, { horaInicio: '09:00', horaFin: '13:00' }])}>
              + Franja
            </Button>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Guardar día
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bloqueos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Desde</Label>
              <Input type="datetime-local" value={bloqueoInicio} onChange={(e) => setBloqueoInicio(e.target.value)} />
            </div>
            <div>
              <Label>Hasta</Label>
              <Input type="datetime-local" value={bloqueoFin} onChange={(e) => setBloqueoFin(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Motivo</Label>
            <Input value={bloqueoMotivo} onChange={(e) => setBloqueoMotivo(e.target.value)} />
          </div>
          <Button
            onClick={() => bloqueoMutation.mutate()}
            disabled={!bloqueoInicio || !bloqueoFin || bloqueoMutation.isPending}
          >
            Crear bloqueo
          </Button>
          <ul className="space-y-2 text-sm">
            {bloqueos.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded border border-border px-3 py-2">
                <span>
                  {new Date(b.fechaInicio).toLocaleString()} – {new Date(b.fechaFin).toLocaleString()}
                  {b.motivo && ` · ${b.motivo}`}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void deleteBloqueo(b.id).then(() => {
                      toast.success('Eliminado');
                      void qc.invalidateQueries({ queryKey: ['bloqueos'] });
                    });
                  }}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
