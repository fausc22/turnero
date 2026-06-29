'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelarReserva,
  createReserva,
  fetchConfig,
  fetchDisponibilidad,
  fetchProfesionales,
  fetchReservaByToken,
  fetchServicios,
  reprogramarReserva,
} from '@/lib/api';
import { getTenantSlug } from '@/lib/tenant-client';

function tenantKey() {
  return getTenantSlug() ?? 'unknown';
}

export function useTenantConfig() {
  return useQuery({
    queryKey: ['tenant', tenantKey(), 'config'],
    queryFn: fetchConfig,
    staleTime: 5 * 60_000,
  });
}

export function useServicios() {
  return useQuery({
    queryKey: ['tenant', tenantKey(), 'servicios'],
    queryFn: fetchServicios,
    staleTime: 5 * 60_000,
  });
}

export function useProfesionales() {
  return useQuery({
    queryKey: ['tenant', tenantKey(), 'profesionales'],
    queryFn: fetchProfesionales,
    staleTime: 5 * 60_000,
  });
}

export function useDisponibilidad(
  fecha: string | null,
  servicioIds: number[],
  profesionalId: number | null,
  enabled = true
) {
  return useQuery({
    queryKey: ['tenant', tenantKey(), 'disponibilidad', fecha, servicioIds, profesionalId],
    queryFn: () =>
      fetchDisponibilidad({
        fecha: fecha!,
        servicioIds,
        profesionalId: profesionalId ?? undefined,
      }),
    enabled: enabled && !!fecha && servicioIds.length > 0,
    staleTime: 0,
  });
}

export function useReservaByToken(token: string | null) {
  return useQuery({
    queryKey: ['tenant', tenantKey(), 'reserva', token],
    queryFn: () => fetchReservaByToken(token!),
    enabled: !!token,
  });
}

export function useCreateReserva() {
  return useMutation({
    mutationFn: (vars: {
      body: Parameters<typeof createReserva>[0];
      idempotencyKey: string;
    }) => createReserva(vars.body, vars.idempotencyKey),
  });
}

export function useCancelarReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelarReserva,
    onSuccess: (_, token) => {
      void qc.invalidateQueries({ queryKey: ['tenant', tenantKey(), 'reserva', token] });
    },
  });
}

export function useReprogramarReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { token: string; fechaInicio: string; profesionalId?: number | null }) =>
      reprogramarReserva(vars.token, {
        fechaInicio: vars.fechaInicio,
        profesionalId: vars.profesionalId,
      }),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ['tenant', tenantKey(), 'reserva', vars.token] });
    },
  });
}
