import { apiClient } from './client';
import { Barberia, EstilosBarberia, ApiResponse } from '@/types';

export const barberiasApi = {
  async findAll(): Promise<Barberia[]> {
    const response = await apiClient.instance.get<ApiResponse<Barberia[]>>('/barberias');
    return response.data.data;
  },

  async findById(id: number): Promise<Barberia> {
    const response = await apiClient.instance.get<ApiResponse<Barberia>>(`/barberias/${id}`);
    return response.data.data;
  },

  async findBySlug(slug: string): Promise<Barberia> {
    const response = await apiClient.instance.get<ApiResponse<Barberia>>(`/barberias/slug/${slug}`);
    return response.data.data;
  },

  async getEstilos(slug: string): Promise<EstilosBarberia | null> {
    try {
      const response = await apiClient.instance.get<ApiResponse<EstilosBarberia>>(
        `/estilos_barberia?slug=${slug}`
      );
      return response.data.data;
    } catch {
      return null;
    }
  },
};

