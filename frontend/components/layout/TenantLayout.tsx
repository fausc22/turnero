'use client';

import { TenantHeader } from './TenantHeader';
import { PageTransition } from './PageTransition';
import type { ReactNode } from 'react';

export function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TenantHeader />
      <main className="flex-1 pb-24">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
