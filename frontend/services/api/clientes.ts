import { apiClient } from './client';
import { Cliente, ApiResponse } from '@/types';

export const clientesApi = {
  async findAll(barberiaId: number): Promise<Cliente[]> {
    const response = await apiClient.instance.get<ApiResponse<Cliente[]>>(
      `/clientes?barberia_id=${barberiaId}`
    );
    return response.data.data;
  },

  async findById(id: number): Promise<Cliente> {
    const response = await apiClient.instance.get<ApiResponse<Cliente>>(`/clientes/${id}`);
    return response.data.data;
  },

  async create(data: Omit<Cliente, 'id' | 'barberia_id' | 'creado_en'>): Promise<Cliente> {
    const response = await apiClient.instance.post<ApiResponse<Cliente>>('/clientes', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Omit<Cliente, 'id' | 'barberia_id' | 'creado_en'>>): Promise<Cliente> {
    const response = await apiClient.instance.put<ApiResponse<Cliente>>(`/clientes/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.instance.delete(`/clientes/${id}`);
  },
};

