# Fase 2 — API pública y disponibilidad

| Tareas | T-039 – T-060 |

## Objetivo
Reserva sin auth, motor disponibilidad real, gestión por token.

## Entregables
- GET config, servicios, profesionales, disponibilidad
- POST reservas con transacción + idempotency
- Tests overlap y slots

## Verificación
```bash
curl -H "x-tenant-slug: peluqueria-naz" \
  "http://api.localhost:4013/api/public/disponibilidad?fecha=2026-06-01&servicioIds=1"
```

## Siguiente
[PHASE-3-FRONTEND-CLIENTE.md](./PHASE-3-FRONTEND-CLIENTE.md)
