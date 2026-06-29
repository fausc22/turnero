'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LandingSkeleton } from '@/components/layout/LoadingSkeleton';
import { createPaymentPreference, getApiErrorMessage } from '@/lib/api';
import { copy } from '@/lib/copy';

function PagoErrorContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const turnoId = params.get('turnoId');
  const [loading, setLoading] = useState(false);

  async function retry() {
    if (!token || !turnoId) return;
    setLoading(true);
    try {
      const pref = await createPaymentPreference({
        turnoId: Number(turnoId),
        tokenGestion: token,
      });
      window.location.href = pref.initPoint;
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-destructive">{copy.pagoError}</h1>
      <p className="text-sm text-muted-foreground">
        El pago fue rechazado o cancelado. Podés intentar de nuevo.
      </p>
      {token && turnoId && (
        <Button onClick={() => void retry()} disabled={loading}>
          {loading ? 'Redirigiendo...' : copy.pagoReintentar}
        </Button>
      )}
      <div>
        <Link href="/" className="text-sm text-primary hover:underline">
          {copy.volverInicio}
        </Link>
      </div>
    </div>
  );
}

export default function PagoErrorPage() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <PagoErrorContent />
    </Suspense>
  );
}
