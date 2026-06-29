import { apiClient } from './client';
import { Servicio, ApiResponse } from '@/types';

export const serviciosApi = {
  async findAll(barberiaId: number, activosOnly = false): Promise<Servicio[]> {
    const url = activosOnly 
      ? `/servicios?barberia_id=${barberiaId}&activos=true`
      : `/servicios?barberia_id=${barberiaId}`;
    const response = await apiClient.instance.get<ApiResponse<Servicio[]>>(url);
    return response.data.data;
  },

  async findById(id: number): Promise<Servicio> {
    const response = await apiClient.instance.get<ApiResponse<Servicio>>(`/servicios/${id}`);
    return response.data.data;
  },

  async create(data: Omit<Servicio, 'id' | 'barberia_id'>): Promise<Servicio> {
    const response = await apiClient.instance.post<ApiResponse<Servicio>>('/servicios', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Omit<Servicio, 'id' | 'barberia_id'>>): Promise<Servicio> {
    const response = await apiClient.instance.put<ApiResponse<Servicio>>(`/servicios/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.instance.delete(`/servicios/${id}`);
  },
};

