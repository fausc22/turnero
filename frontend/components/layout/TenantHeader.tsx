'use client';

import Link from 'next/link';
import { useTenant } from '@/context/TenantContext';
import { Skeleton } from '@/components/ui/skeleton';
import { getTenantSlug } from '@/lib/tenant-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013';

export function TenantHeader() {
  const { config, isLoading } = useTenant();
  const nombre = config?.nombre ?? 'Tu comercio';
  const slug = getTenantSlug();
  const logoUrl = `${API_URL}/api/public/asset/logo${slug ? `?slug=${encodeURIComponent(slug)}` : ''}`;

  return (
    <header className="border-b border-border bg-[var(--bg-elevated)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt=""
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-sm font-semibold text-primary">
              {nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <span className="font-semibold">{nombre}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
