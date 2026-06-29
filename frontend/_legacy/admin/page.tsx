'use client';

import { useAuth } from '@/context/AuthContext';
import { useTurnos } from '@/hooks/useTurnos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EstadoTurno } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { turnos, loading } = useTurnos(user?.barberia_id || null);

  const turnosHoy = turnos.filter(t => {
    const fecha = new Date(t.fecha_inicio);
    const hoy = new Date();
    return fecha.toDateString() === hoy.toDateString();
  });

  const turnosConfirmados = turnos.filter(t => t.estado === EstadoTurno.CONFIRMADO);
  const ingresosTotales = turnosConfirmados.reduce((sum, t) => sum + parseFloat(t.precio_total.toString()), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Turnos Hoy</CardTitle>
            <CardDescription>Turnos programados para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{turnosHoy.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Turnos</CardTitle>
            <CardDescription>Turnos en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{turnos.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
            <CardDescription>De turnos confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${ingresosTotales.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Turnos Recientes</CardTitle>
          <CardDescription>Últimos turnos creados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando...</p>
          ) : turnos.length === 0 ? (
            <p className="text-gray-500">No hay turnos</p>
          ) : (
            <div className="space-y-2">
              {turnos.slice(0, 10).map((turno) => (
                <div
                  key={turno.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Turno #{turno.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(turno.fecha_inicio).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${turno.precio_total}</p>
                    <p className="text-sm text-gray-500">{turno.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

