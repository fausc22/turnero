import axios from 'axios';
import { getPanelToken, getTenantSlug, clearPanelSession } from './auth-storage';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013',
  headers: { 'Content-Type': 'application/json' },
});

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
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      clearPanelSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
