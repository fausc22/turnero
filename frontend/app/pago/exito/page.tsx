'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LandingSkeleton } from '@/components/layout/LoadingSkeleton';
import { usePaymentPoll } from '@/hooks/public/usePaymentPoll';
import { copy } from '@/lib/copy';

function PagoExitoContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const { isLoading, isConfirmed } = usePaymentPoll(token);

  if (!token) {
    return <p className="px-4 py-12 text-center text-muted-foreground">Enlace inválido.</p>;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
      <h1 className="text-xl font-semibold">
        {isConfirmed ? '¡Listo!' : copy.pagoExitoRedirigiendo}
      </h1>
      {isLoading && <p className="mt-2 text-sm text-muted-foreground">{copy.pagoProcesando}</p>}
    </div>
  );
}

export default function PagoExitoPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <PagoExitoContent />
    </Suspense>
  );
}
