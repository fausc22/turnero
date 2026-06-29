import { apiClient } from './client';
import { ApiResponse } from '@/types';

interface CreatePreferenceData {
  turnoId: number;
  backUrl: string;
}

export const pagosApi = {
  async createPreference(data: CreatePreferenceData): Promise<any> {
    const response = await apiClient.instance.post<ApiResponse<any>>(
      '/pagos/preference',
      data
    );
    return response.data.data;
  },
};

