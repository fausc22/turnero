import { apiClient } from './client';
import { LoginResponse, Usuario, ApiResponse } from '@/types';

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.instance.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      { email, password }
    );
    return response.data.data;
  },

  async refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await apiClient.instance.post<ApiResponse<{ token: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.data;
  },

  async getMe(): Promise<Usuario> {
    const response = await apiClient.instance.get<ApiResponse<Usuario>>('/usuarios/me');
    return response.data.data;
  },
};

