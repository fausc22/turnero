'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, type ReactNode } from 'react';
import { TenantProvider } from '@/context/TenantContext';

export function Providers({ slug, children }: { slug: string | null; children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider slug={slug}>
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </TenantProvider>
    </QueryClientProvider>
  );
}
