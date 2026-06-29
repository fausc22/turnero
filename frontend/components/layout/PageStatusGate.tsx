'use client';

import { useTenant } from '@/context/TenantContext';
import { copy } from '@/lib/copy';
import { LandingSkeleton } from './LoadingSkeleton';
import type { ReactNode } from 'react';

export function PageStatusGate({ children }: { children: ReactNode }) {
  const { config, isLoading, isError } = useTenant();

  if (isLoading) return <LandingSkeleton />;
  if (isError || !config) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">No pudimos cargar la información del local.</p>
      </div>
    );
  }

  if (config.pageStatus === 'BLOQUEADA') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">403</h1>
        <p className="mt-2 text-muted-foreground">{copy.bloqueada}</p>
      </div>
    );
  }

  if (config.pageStatus === 'MANTENIMIENTO') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold">{copy.mantenimiento}</h1>
      </div>
    );
  }

  return <>{children}</>;
}
