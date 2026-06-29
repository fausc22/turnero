'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LandingSkeleton } from '@/components/layout/LoadingSkeleton';
import { useTenant } from '@/context/TenantContext';
import { useServicios } from '@/hooks/public/usePublicQueries';
import { copy } from '@/lib/copy';
import { formatDuracion, formatPrecio } from '@/lib/format';
import type { ServicioPublico } from '@/types/public';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013';

function topServicios(servicios: ServicioPublico[]): ServicioPublico[] {
  return [...servicios].sort((a, b) => a.orden - b.orden).slice(0, 4);
}

export function LandingContent() {
  const { config, isLoading, bookingEnabled } = useTenant();
  const { data: categorias } = useServicios();

  if (isLoading) return <LandingSkeleton />;

  const allServicios = categorias?.flatMap((c) => c.servicios) ?? [];
  const destacados = topServicios(allServicios);
  const heroUrl = `${API_URL}/api/public/asset/hero`;
  const logoUrl = `${API_URL}/api/public/asset/logo`;
  const pausada = config?.pageStatus === 'PAUSADA';
  const mapsUrl =
    config?.direccionLat != null && config?.direccionLng != null
      ? `https://www.google.com/maps?q=${config.direccionLat},${config.direccionLng}`
      : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          className="h-10 max-w-[120px] object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-muted min-h-[200px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="relative z-10 flex min-h-[200px] flex-col justify-end bg-gradient-to-t from-[#0a0a0b] to-transparent p-6">
          <h1 className="text-3xl font-semibold tracking-tight">{config?.nombre}</h1>
          {config?.textoBienvenida && (
            <p className="mt-2 text-muted-foreground">{config.textoBienvenida}</p>
          )}
        </div>
      </div>

      {pausada && (
        <p className="mb-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          {copy.reservasPausadas}
        </p>
      )}

      {(config?.direccion || config?.telefono) && (
        <div className="mb-8 space-y-1 text-sm text-muted-foreground">
          {config.direccion && <p>{config.direccion}</p>}
          {mapsUrl && (
            <p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Cómo llegar
              </a>
            </p>
          )}
          {config.telefono && (
            <p>
              <a href={`tel:${config.telefono}`} className="hover:text-foreground">
                {config.telefono}
              </a>
            </p>
          )}
        </div>
      )}

      {destacados.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium">Servicios destacados</h2>
          <ul className="space-y-2">
            {destacados.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
              >
                <span>{s.nombre}</span>
                <span className="text-muted-foreground">
                  {formatDuracion(s.duracionMinutos)} · {formatPrecio(s.precio)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {bookingEnabled ? (
        <Link
          href="/reservar"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {copy.reservar}
        </Link>
      ) : (
        <Button className="w-full" size="lg" disabled>
          {copy.reservar}
        </Button>
      )}
    </div>
  );
}
