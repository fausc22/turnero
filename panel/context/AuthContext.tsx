'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import {
  getStoredUser,
  getTenantSlug,
  setPanelSession,
  clearPanelSession,
  type StoredUser,
} from '@/lib/auth-storage';

interface AuthContextValue {
  usuario: StoredUser | null;
  tenantSlug: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<StoredUser | null>(null);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsuario(getStoredUser());
    setTenantSlug(getTenantSlug());
    setLoading(false);
  }, []);

  async function login(email: string, password: string, rememberMe = false) {
    const { data } = await api.post('/api/auth/login', { email, password, rememberMe });
    const { token, refreshToken, tenantSlug: slug, usuario: u } = data.data;
    setPanelSession({ token, refreshToken, tenantSlug: slug, usuario: u });
    setUsuario(u);
    setTenantSlug(slug);
  }

  function logout() {
    clearPanelSession();
    setUsuario(null);
    setTenantSlug(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ usuario, tenantSlug, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
