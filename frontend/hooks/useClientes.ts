import { useState, useEffect } from 'react';
import { clientesApi } from '@/services/api/clientes';
import { Cliente } from '@/types';

export function useClientes(barberiaId: number | null) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    if (!barberiaId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await clientesApi.findAll(barberiaId);
      setClientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [barberiaId]);

  const createCliente = async (data: Omit<Cliente, 'id' | 'barberia_id' | 'creado_en'>) => {
    try {
      const newCliente = await clientesApi.create(data);
      await fetchClientes();
      return newCliente;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear cliente');
    }
  };

  const updateCliente = async (id: number, data: Partial<Omit<Cliente, 'id' | 'barberia_id' | 'creado_en'>>) => {
    try {
      const updated = await clientesApi.update(id, data);
      await fetchClientes();
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar cliente');
    }
  };

  const deleteCliente = async (id: number) => {
    try {
      await clientesApi.delete(id);
      await fetchClientes();
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar cliente');
    }
  };

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
}

