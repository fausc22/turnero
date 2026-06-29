import { apiClient } from './client';
import { Producto, ApiResponse } from '@/types';

export const productosApi = {
  async findAll(barberiaId: number, activosOnly = false): Promise<Producto[]> {
    const url = activosOnly 
      ? `/productos?barberia_id=${barberiaId}&activos=true`
      : `/productos?barberia_id=${barberiaId}`;
    const response = await apiClient.instance.get<ApiResponse<Producto[]>>(url);
    return response.data.data;
  },

  async findById(id: number): Promise<Producto> {
    const response = await apiClient.instance.get<ApiResponse<Producto>>(`/productos/${id}`);
    return response.data.data;
  },

  async create(data: Omit<Producto, 'id' | 'barberia_id'>): Promise<Producto> {
    const response = await apiClient.instance.post<ApiResponse<Producto>>('/productos', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Omit<Producto, 'id' | 'barberia_id'>>): Promise<Producto> {
    const response = await apiClient.instance.put<ApiResponse<Producto>>(`/productos/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.instance.delete(`/productos/${id}`);
  },
};

