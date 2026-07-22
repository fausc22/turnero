import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getPanelToken,
  getPanelRefreshToken,
  getTenantSlug,
  clearPanelSession,
  setPanelSession,
  getStoredUser,
} from './auth-storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getPanelRefreshToken();
  const tenantSlug = getTenantSlug();
  if (!refreshToken || !tenantSlug) return null;

  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013'}/api/auth/refresh`,
    { refreshToken, tenantSlug }
  );
  const token = data?.data?.token as string | undefined;
  const newRefresh = data?.data?.refreshToken as string | undefined;
  const usuario = getStoredUser();
  if (!token || !newRefresh || !usuario) return null;
  setPanelSession({ token, refreshToken: newRefresh, tenantSlug, usuario });
  return token;
}

api.interceptors.request.use((config) => {
  const token = getPanelToken();
  const slug = getTenantSlug();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (slug) {
    config.headers['x-tenant-slug'] = slug;
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
        // fall through to logout
      }
      clearPanelSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
