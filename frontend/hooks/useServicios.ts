import { useState, useEffect } from 'react';
import { serviciosApi } from '@/services/api/servicios';
import { Servicio } from '@/types';

export function useServicios(barberiaId: number | null, activosOnly = false) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServicios = async () => {
    if (!barberiaId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await serviciosApi.findAll(barberiaId, activosOnly);
      setServicios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, [barberiaId, activosOnly]);

  const createServicio = async (data: Omit<Servicio, 'id' | 'barberia_id'>) => {
    try {
      const newServicio = await serviciosApi.create(data);
      await fetchServicios();
      return newServicio;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear servicio');
    }
  };

  const updateServicio = async (id: number, data: Partial<Omit<Servicio, 'id' | 'barberia_id'>>) => {
    try {
      const updated = await serviciosApi.update(id, data);
      await fetchServicios();
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar servicio');
    }
  };

  const deleteServicio = async (id: number) => {
    try {
      await serviciosApi.delete(id);
      await fetchServicios();
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar servicio');
    }
  };

  return {
    servicios,
    loading,
    error,
    refetch: fetchServicios,
    createServicio,
    updateServicio,
    deleteServicio,
  };
}

