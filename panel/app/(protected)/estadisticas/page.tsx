'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsString, useQueryStates } from 'nuqs';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchEstadisticasResumen } from '@/lib/tenant-api';

type Period = 'today' | 'week' | 'month' | 'custom';

function resolveRange(period: Period, fromStr: string, toStr: string) {
  const now = new Date();
  if (period === 'today') {
    return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() };
  }
  if (period === 'week') {
    return {
      from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
      to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    };
  }
  if (period === 'month') {
    return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() };
  }
  return {
    from: fromStr ? new Date(fromStr).toISOString() : startOfMonth(now).toISOString(),
    to: toStr ? new Date(toStr + 'T23:59:59').toISOString() : endOfMonth(now).toISOString(),
  };
}

export default function EstadisticasPage() {
  const [params, setParams] = useQueryStates({
    period: parseAsString.withDefault('month'),
    from: parseAsString.withDefault(''),
    to: parseAsString.withDefault(''),
  });

  const period = (params.period as Period) || 'month';
  const range = useMemo(
    () => resolveRange(period, params.from, params.to),
    [period, params.from, params.to]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['estadisticas', range.from, range.to],
    queryFn: () => fetchEstadisticasResumen(range.from, range.to),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Estadísticas</h1>
        <div className="flex flex-wrap gap-2">
          {(['today', 'week', 'month'] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'outline'}
              onClick={() => setParams({ period: p, from: '', to: '' })}
            >
              {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}
            </Button>
          ))}
        </div>
      </div>

      {period === 'custom' && (
        <div className="flex gap-2">
          <input
            type="date"
            className="rounded border border-border bg-background px-2 py-1 text-sm"
            value={params.from}
            onChange={(e) => setParams({ period: 'custom', from: e.target.value })}
          />
          <input
            type="date"
            className="rounded border border-border bg-background px-2 py-1 text-sm"
            value={params.to}
            onChange={(e) => setParams({ period: 'custom', to: e.target.value })}
          />
        </div>
      )}

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total turnos</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{data.totalTurnos}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">${data.ingresos.toLocaleString('es-AR')}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasa no-show</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{data.tasaNoShow}%</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket promedio</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">${data.ticketPromedio.toLocaleString('es-AR')}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Turnos por día</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.turnosPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="fecha" tickFormatter={(v) => format(new Date(v), 'dd/MM')} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {data.advanced && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Servicios top</CardTitle>
                </CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.serviciosTop} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis type="category" dataKey="nombre" width={100} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Horarios pico</CardTitle>
                </CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.horariosPico}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hora" tickFormatter={(h) => `${h}h`} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Ingresos por día</CardTitle>
                </CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.ingresosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="fecha" tickFormatter={(v) => format(new Date(v), 'dd/MM')} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
