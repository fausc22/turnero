import { Response } from 'express';

type SseResponse = Response;

const sseClients = new Map<string, Set<SseResponse>>();
const pingIntervals = new Map<string, NodeJS.Timeout>();

function ensurePing(tenantSlug: string): void {
  if (pingIntervals.has(tenantSlug)) return;

  const interval = setInterval(() => {
    broadcastTenantEvent(tenantSlug, 'ping', { ts: new Date().toISOString() });
  }, 30_000);

  pingIntervals.set(tenantSlug, interval);
}

function cleanupTenant(tenantSlug: string): void {
  const clients = sseClients.get(tenantSlug);
  if (!clients?.size) {
    const interval = pingIntervals.get(tenantSlug);
    if (interval) {
      clearInterval(interval);
      pingIntervals.delete(tenantSlug);
    }
    sseClients.delete(tenantSlug);
  }
}

export function registerSseClient(tenantSlug: string, res: SseResponse): void {
  if (!sseClients.has(tenantSlug)) {
    sseClients.set(tenantSlug, new Set());
  }
  sseClients.get(tenantSlug)!.add(res);
  ensurePing(tenantSlug);

  res.on('close', () => {
    sseClients.get(tenantSlug)?.delete(res);
    cleanupTenant(tenantSlug);
  });
}

export function broadcastTenantEvent(tenantSlug: string, event: string, data: object): void {
  const clients = sseClients.get(tenantSlug);
  if (!clients?.size) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
  cleanupTenant(tenantSlug);
}

export function getSseClientCount(tenantSlug: string): number {
  return sseClients.get(tenantSlug)?.size ?? 0;
}
