'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LandingSkeleton } from '@/components/layout/LoadingSkeleton';
import { usePaymentPoll } from '@/hooks/public/usePaymentPoll';
import { copy } from '@/lib/copy';

function PagoPendienteContent() {
  const params = useSearchParams();
  const token = params.get('token');
  usePaymentPoll(token);

  if (!token) {
    return <p className="px-4 py-12 text-center text-muted-foreground">Enlace inválido.</p>;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <Loader2 className="mb-4 h-10 w-10 animate-spin text-warning" />
      <h1 className="text-xl font-semibold">{copy.pagoPendiente}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.pagoProcesando}</p>
    </div>
  );
}

export default function PagoPendientePage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <PagoPendienteContent />
    </Suspense>
  );
}
