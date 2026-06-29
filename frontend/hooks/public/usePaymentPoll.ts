'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchReservaByToken } from '@/lib/api';

const POLL_MS = 2000;
const TIMEOUT_MS = 60_000;

export function usePaymentPoll(token: string | null, targetPath = '/confirmacion') {
  const router = useRouter();

  const query = useQuery({
    queryKey: ['reserva-poll', token],
    queryFn: () => fetchReservaByToken(token!),
    enabled: !!token,
    refetchInterval: (q) => (q.state.data?.estado === 'CONFIRMADO' ? false : POLL_MS),
  });

  useEffect(() => {
    if (!token) return;
    if (query.data?.estado === 'CONFIRMADO') {
      router.replace(`${targetPath}?token=${encodeURIComponent(token)}`);
    }
  }, [query.data?.estado, token, router, targetPath]);

  useEffect(() => {
    if (!token) return;
    const t = setTimeout(() => {
      if (query.data?.estado !== 'CONFIRMADO') {
        query.refetch();
      }
    }, TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [token, query]);

  return {
    turno: query.data,
    isLoading: query.isLoading,
    isConfirmed: query.data?.estado === 'CONFIRMADO',
    isPending: query.data?.estado === 'PENDIENTE',
  };
}
