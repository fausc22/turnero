'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingSkeleton } from '@/components/layout/LoadingSkeleton';
import { useReservaByToken } from '@/hooks/public/usePublicQueries';
import { useTenant } from '@/context/TenantContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { copy } from '@/lib/copy';
import { formatFechaHora, formatPrecio } from '@/lib/format';
import { buildIcsEvent, downloadIcs } from '@/lib/ics';

function ConfirmacionContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const { config } = useTenant();
  const reduced = useReducedMotion();
  const { data: turno, isLoading, isError } = useReservaByToken(token);

  if (!token) {
    return <p className="px-4 py-12 text-center text-muted-foreground">Token inválido.</p>;
  }
  if (isLoading) return <LandingSkeleton />;
  if (isError || !turno) {
    return <p className="px-4 py-12 text-center text-muted-foreground">No encontramos tu turno.</p>;
  }

  const handleIcs = () => {
    const ics = buildIcsEvent({
      title: `Turno — ${config?.nombre ?? 'Local'}`,
      start: turno.fechaInicio,
      end: turno.fechaFin,
      description: turno.servicios.map((s) => s.nombre).join(', '),
      location: config?.direccion ?? undefined,
    });
    downloadIcs('turno.ics', ics);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      {reduced ? (
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
          <Check className="h-8 w-8" />
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success"
        >
          <Check className="h-8 w-8" />
        </motion.div>
      )}
      <h1 className="text-2xl font-semibold">{copy.turnoConfirmado}</h1>
      <p className="mt-2 text-muted-foreground">{formatFechaHora(turno.fechaInicio)}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {turno.servicios.map((s) => s.nombre).join(', ')} · {formatPrecio(turno.precioTotal)}
      </p>
      <p className="mt-4 text-sm text-muted-foreground">{copy.whatsappConfirmacion}</p>
      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={handleIcs} variant="outline">
          {copy.agregarCalendario}
        </Button>
        <Link
          href={`/gestionar/${token}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {copy.gestionarTurno}
        </Link>
        <Link href="/" className="inline-flex h-10 items-center justify-center text-sm text-muted-foreground hover:text-foreground">
          {copy.volverInicio}
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <ConfirmacionContent />
    </Suspense>
  );
}
