'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { toast } from 'sonner';
import { getPanelToken, getTenantSlug } from '@/lib/auth-storage';

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    /* ignore */
  }
}

export function useTenantSse(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const token = getPanelToken();
    const slug = getTenantSlug();
    if (!token || !slug) return;

    const base = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost:4013';
    const ctrl = new AbortController();

    void fetchEventSource(`${base}/api/tenant/events/stream`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-tenant-slug': slug,
      },
      signal: ctrl.signal,
      onmessage(ev) {
        if (ev.event === 'turno.created') {
          void qc.invalidateQueries({ queryKey: ['agenda'] });
          void qc.invalidateQueries({ queryKey: ['turnos'] });
          toast.success('Nueva reserva online');
          playNotificationSound();
        }
        if (ev.event === 'turno.updated' || ev.event === 'turno.cancelled') {
          void qc.invalidateQueries({ queryKey: ['agenda'] });
          void qc.invalidateQueries({ queryKey: ['turnos'] });
        }
      },
      onerror() {
        /* reconnect handled by library */
      },
    });

    return () => ctrl.abort();
  }, [enabled, qc]);
}
