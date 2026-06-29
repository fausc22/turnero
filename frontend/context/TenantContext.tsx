'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { PublicConfig } from '@/types/public';
import { useTenantConfig } from '@/hooks/public/usePublicQueries';
import { hexToHsl } from '@/lib/tenant-client';

interface TenantContextValue {
  slug: string | null;
  config: PublicConfig | null;
  isLoading: boolean;
  isError: boolean;
  bookingEnabled: boolean;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ slug, children }: { slug: string | null; children: ReactNode }) {
  const { data, isLoading, isError } = useTenantConfig();

  useEffect(() => {
    const color = data?.estilos?.colorPrimario;
    if (color) {
      const hsl = hexToHsl(color);
      if (hsl) {
        document.documentElement.style.setProperty('--tenant-accent', hsl);
        document.documentElement.style.setProperty('--primary', hsl);
      }
    }
  }, [data?.estilos?.colorPrimario]);

  const value: TenantContextValue = {
    slug,
    config: data ?? null,
    isLoading,
    isError,
    bookingEnabled: data?.bookingEnabled ?? false,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant debe usarse dentro de TenantProvider');
  return ctx;
}
