# Frontend cliente — Overview

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [SCREENS.md](./SCREENS.md), [02-arquitectura/SUBDOMAINS-AND-ROUTING.md](../02-arquitectura/SUBDOMAINS-AND-ROUTING.md) |
| Bloquea a | frontend/ app |

---

## Propósito

App Next.js servida en **`{slug}.localhost:4010`**. El tenant se resuelve del Host, no de la URL path.

---

## Principios UX

- Mobile-first (80%+ tráfico)
- Dark theme por defecto con acento del tenant
- Máximo 5 pasos hasta confirmación
- Sin login cliente
- Progressive disclosure: servicios → profesional → fecha → datos → pago

---

## Stack app

Next.js 16 App Router, TanStack Query, Framer Motion, shadcn/Radix.

---

## Middleware

`frontend/middleware.ts` extrae slug → set header interno → rewrite si necesario.

---

## API client

`lib/api.ts`: axios base `http://api.localhost:4013`, interceptor agrega `x-tenant-slug` desde `getTenantSlugFromHost()`.

---

## Rutas

| Ruta | Página |
|------|--------|
| `/` | Landing tenant |
| `/reservar` | Wizard reserva |
| `/confirmacion/[turnoId]` | Éxito |
| `/pago/exito`, `/pago/error`, `/pago/pendiente` | MP returns |
| `/gestionar/[token]` | Cancelar/reprogramar |

---

## Estados page_status

| Status | UI |
|--------|-----|
| ACTIVA | Normal |
| PAUSADA | Hero + mensaje, CTA deshabilitado |
| MANTENIMIENTO | Minimal |
| BLOQUEADA | 403 page |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
