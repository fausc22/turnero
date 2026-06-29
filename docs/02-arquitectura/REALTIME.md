# Tiempo real (SSE) — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [REUSE-CARRITO.md](../03-stack/REUSE-CARRITO.md) |
| Bloquea a | Panel agenda, notification UX |

---

## Objetivo

Notificar al panel del local cuando ocurre una **nueva reserva online** sin refrescar manualmente.

Patrón adaptado de **carrito** (SSE pedidos nuevos).

---

## Endpoint

```
GET /api/tenant/events/stream
Headers: Authorization, x-tenant-slug
Content-Type: text/event-stream
```

---

## Eventos

| Event | Payload | Trigger |
|-------|---------|---------|
| `turno.created` | `{ turnoId, cliente, fechaInicio, servicios }` | POST reserva pública |
| `turno.updated` | `{ turnoId, estado }` | Cambio estado |
| `turno.cancelled` | `{ turnoId }` | Cancelación |
| `ping` | `{ ts }` | Cada 30s keep-alive |

---

## Implementación backend

```typescript
// Map tenantSlug -> Set<Response>
const sseClients = new Map<string, Set<SseResponse>>();

function broadcastTenantEvent(tenantSlug: string, event: string, data: object) {
  const clients = sseClients.get(tenantSlug);
  clients?.forEach(res => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}
```

Llamar desde `turnoService` post-create.

---

## Frontend panel

```typescript
useEffect(() => {
  const es = new EventSource(url, { headers: /* via polyfill fetch stream */ });
  es.addEventListener('turno.created', (e) => {
    queryClient.invalidateQueries(['turnos']);
    toast.success('Nueva reserva');
    playSound();
  });
}, []);
```

Nota: EventSource nativo no soporta headers; usar `@microsoft/fetch-event-source` o similar.

---

## Alternativa Socket.io

Carrito usa también Socket.io. Para TuTurno **SSE es suficiente** en v1 (menos complejidad). Socket.io reservado si se necesita bidireccional en v2.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
