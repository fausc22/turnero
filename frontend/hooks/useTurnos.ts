import { useState, useEffect } from 'react';
import { turnosApi } from '@/services/api/turnos';
import { Turno, EstadoTurno } from '@/types';

export function useTurnos(barberiaId: number | null, filters?: {
  estado?: EstadoTurno;
  fechaDesde?: string;
  fechaHasta?: string;
}) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTurnos = async () => {
    if (!barberiaId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await turnosApi.findAll(barberiaId, filters);
      setTurnos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar turnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurnos();
  }, [barberiaId, filters?.estado, filters?.fechaDesde, filters?.fechaHasta]);

  const createTurno = async (data: Parameters<typeof turnosApi.create>[0]) => {
    try {
      const newTurno = await turnosApi.create(data);
      await fetchTurnos();
      return newTurno;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear turno');
    }
  };

  const updateTurno = async (id: number, data: Parameters<typeof turnosApi.update>[1]) => {
    try {
      const updated = await turnosApi.update(id, data);
      await fetchTurnos();
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar turno');
    }
  };

  const deleteTurno = async (id: number) => {
    try {
      await turnosApi.delete(id);
      await fetchTurnos();
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar turno');
    }
  };

  return {
    turnos,
    loading,
    error,
    refetch: fetchTurnos,
    createTurno,
    updateTurno,
    deleteTurno,
  };
}

