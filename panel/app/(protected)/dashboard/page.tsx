'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Plus, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchTurnos } from '@/lib/tenant-api';
import type { TurnoListItem } from '@/lib/tenant-api';
import { CrearTurnoModal } from '@/components/agenda/CrearTurnoModal';
import { ESTADO_STYLES } from '@/lib/agenda-utils';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [crearOpen, setCrearOpen] = useState(false);
  const today = new Date();
  const from = startOfDay(today).toISOString();
  const to = endOfDay(today).toISOString();
  const monthFrom = startOfMonth(today).toISOString();
  const monthTo = endOfMonth(today).toISOString();

  const { data: turnosHoy = [] } = useQuery({
    queryKey: ['turnos', 'hoy', from, to],
    queryFn: () => fetchTurnos({ from, to }),
  });

  const { data: turnosMes = [] } = useQuery({
    queryKey: ['turnos', 'mes', monthFrom, monthTo],
    queryFn: () => fetchTurnos({ from: monthFrom, to: monthTo, estado: 'NO_ASISTIO' }),
  });

  const stats = useMemo(() => {
    const confirmados = turnosHoy.filter((t) => t.estado === 'CONFIRMADO').length;
    const pendientes = turnosHoy.filter((t) => t.estado === 'PENDIENTE').length;
    const proximo = [...turnosHoy]
      .filter((t) => ['PENDIENTE', 'CONFIRMADO'].includes(t.estado))
      .filter((t) => new Date(t.fechaInicio) >= today)
      .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())[0];
    const ultimos = [...turnosHoy]
      .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
      .slice(0, 5);
    return { confirmados, pendientes, proximo, ultimos };
  }, [turnosHoy, today]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Inicio</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {format(today, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCrearOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Nuevo turno
          </Button>
          <Link href="/horarios">
            <Button variant="outline">
              <CalendarClock className="mr-1 h-4 w-4" />
              Bloquear horario
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Turnos hoy" value={turnosHoy.length} />
        <StatCard title="Confirmados" value={stats.confirmados} />
        <StatCard title="Pendientes" value={stats.pendientes} />
        <StatCard title="No-shows (mes)" value={turnosMes.length} />
      </div>

      {stats.proximo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximo turno</CardTitle>
          </CardHeader>
          <CardContent>
            <ProximoTurno turno={stats.proximo} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Turnos de hoy</CardTitle>
          <Link href="/turnos" className="text-sm text-primary hover:underline">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.ultimos.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay turnos hoy</p>
          )}
          {stats.ultimos.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded border border-border px-3 py-2 text-sm">
              <div>
                <span className="font-medium">{format(new Date(t.fechaInicio), 'HH:mm')}</span>{' '}
                {t.clienteNombre}
              </div>
              <Badge variant="outline" className={cn('text-[10px]', ESTADO_STYLES[t.estado])}>
                {t.estado}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <CrearTurnoModal open={crearOpen} onClose={() => setCrearOpen(false)} />
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ProximoTurno({ turno }: { turno: TurnoListItem }) {
  const mins = differenceInMinutes(new Date(turno.fechaInicio), new Date());
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{turno.clienteNombre}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(turno.fechaInicio), "HH:mm '·' EEEE", { locale: es })}
          {turno.profesionalNombre && ` · ${turno.profesionalNombre}`}
        </p>
      </div>
      <p className="text-lg font-semibold text-primary">
        {mins > 0 ? `en ${mins} min` : 'ahora'}
      </p>
    </div>
  );
}
