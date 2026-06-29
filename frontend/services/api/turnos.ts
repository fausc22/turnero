import { apiClient } from './client';
import { Turno, EstadoTurno, ApiResponse } from '@/types';

interface CreateTurnoData {
  cliente_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: EstadoTurno;
  servicios?: number[];
  productos?: Array<{ producto_id: number; cantidad: number }>;
}

export const turnosApi = {
  async findAll(barberiaId: number, filters?: {
    estado?: EstadoTurno;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<Turno[]> {
    const params = new URLSearchParams();
    params.append('barberia_id', barberiaId.toString());
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);

    const response = await apiClient.instance.get<ApiResponse<Turno[]>>(
      `/turnos?${params.toString()}`
    );
    return response.data.data;
  },

  async findById(id: number): Promise<Turno> {
    const response = await apiClient.instance.get<ApiResponse<Turno>>(`/turnos/${id}`);
    return response.data.data;
  },

  async create(data: CreateTurnoData): Promise<Turno> {
    const response = await apiClient.instance.post<ApiResponse<Turno>>('/turnos', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<Omit<Turno, 'id' | 'barberia_id' | 'creado_en'>>): Promise<Turno> {
    const response = await apiClient.instance.put<ApiResponse<Turno>>(`/turnos/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.instance.delete(`/turnos/${id}`);
  },
};

