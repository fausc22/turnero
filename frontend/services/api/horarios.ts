import { apiClient } from './client';
import { HorarioBarberia, BloqueoHorario, ApiResponse } from '@/types';

export const horariosApi = {
  async getHorarios(barberiaId: number): Promise<HorarioBarberia[]> {
    const response = await apiClient.instance.get<ApiResponse<HorarioBarberia[]>>(
      `/horarios_barberia?barberia_id=${barberiaId}`
    );
    return response.data.data;
  },

  async getBloqueos(barberiaId: number, fechaDesde?: string, fechaHasta?: string): Promise<BloqueoHorario[]> {
    const params = new URLSearchParams();
    params.append('barberia_id', barberiaId.toString());
    if (fechaDesde) params.append('fechaDesde', fechaDesde);
    if (fechaHasta) params.append('fechaHasta', fechaHasta);

    const response = await apiClient.instance.get<ApiResponse<BloqueoHorario[]>>(
      `/bloqueos_horarios?${params.toString()}`
    );
    return response.data.data;
  },
};

