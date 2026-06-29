'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/services/api/auth';
import { apiClient } from '@/services/api/client';
import { Usuario, Rol } from '@/types';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          // Si falla, intentar decodificar del token
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: payload.usuarioId,
              barberia_id: payload.barberiaId,
              nombre: payload.email.split('@')[0],
              email: payload.email,
              rol: payload.rol,
              activo: true,
              creado_en: new Date().toISOString(),
            });
          } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    apiClient.setAuthToken(response.token, response.refreshToken);
    setUser(response.usuario);
  };

  const logout = () => {
    apiClient.clearAuth();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.rol === Rol.ADMIN_BARBERIA || user?.rol === Rol.SUPER_ADMIN;
  const isSuperAdmin = user?.rol === Rol.SUPER_ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

