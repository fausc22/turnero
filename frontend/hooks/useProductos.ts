import { useState, useEffect } from 'react';
import { productosApi } from '@/services/api/productos';
import { Producto } from '@/types';

export function useProductos(barberiaId: number | null, activosOnly = false) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = async () => {
    if (!barberiaId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await productosApi.findAll(barberiaId, activosOnly);
      setProductos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [barberiaId, activosOnly]);

  const createProducto = async (data: Omit<Producto, 'id' | 'barberia_id'>) => {
    try {
      const newProducto = await productosApi.create(data);
      await fetchProductos();
      return newProducto;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear producto');
    }
  };

  const updateProducto = async (id: number, data: Partial<Omit<Producto, 'id' | 'barberia_id'>>) => {
    try {
      const updated = await productosApi.update(id, data);
      await fetchProductos();
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar producto');
    }
  };

  const deleteProducto = async (id: number) => {
    try {
      await productosApi.delete(id);
      await fetchProductos();
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar producto');
    }
  };

  return {
    productos,
    loading,
    error,
    refetch: fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
  };
}

