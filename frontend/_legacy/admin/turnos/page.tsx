'use client';

import { useAuth } from '@/context/AuthContext';
import { useTurnos } from '@/hooks/useTurnos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EstadoTurno } from '@/types';

export default function TurnosPage() {
  const { user } = useAuth();
  const { turnos, loading, deleteTurno } = useTurnos(user?.barberia_id || null);

  const handleCancelar = async (id: number) => {
    if (confirm('¿Estás seguro de cancelar este turno?')) {
      try {
        await deleteTurno(id);
      } catch (error) {
        alert('Error al cancelar turno');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Turnos</h1>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : turnos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No hay turnos
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {turnos.map((turno) => (
            <Card key={turno.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Turno #{turno.id}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(turno.fecha_inicio).toLocaleString()} -{' '}
                      {new Date(turno.fecha_fin).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${turno.precio_total}</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        turno.estado === EstadoTurno.CONFIRMADO
                          ? 'bg-green-100 text-green-800'
                          : turno.estado === EstadoTurno.PENDIENTE
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {turno.estado}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  {turno.estado !== EstadoTurno.CANCELADO && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelar(turno.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

