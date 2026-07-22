import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSuperToken, getSuperRefreshToken, clearSuperTokens, setSuperTokens } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getSuperRefreshToken();
  if (!refreshToken) return null;
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013'}/api/super/auth/refresh`,
    { refreshToken }
  );
  const token = data?.data?.token as string | undefined;
  const newRefresh = data?.data?.refreshToken as string | undefined;
  if (!token || !newRefresh) return null;
  setSuperTokens(token, newRefresh);
  return token;
}

api.interceptors.request.use((config) => {
  const token = getSuperToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status === 401 && typeof window !== 'undefined' && original && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const token = await refreshPromise;
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        // logout
      }
      clearSuperTokens();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
