# Reutilización — carrito

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [02-arquitectura/REALTIME.md](../02-arquitectura/REALTIME.md) |
| Bloquea a | SSE, MP, media, geocoding |

---

## Mapa concepto → TuTurno

| Origen carrito | Destino TuTurno | Notas |
|----------------|-----------------|-------|
| `backend/middlewares/tenant.js` (X-Store-Slug) | x-tenant-slug | Mismo concepto |
| SSE pedidos nuevos | SSE turno.created | Adaptar eventos |
| Mercado Pago preferencia + webhook | pagos turnos | Legacy turnero + carrito |
| `uploads/stores/{id}/` | `uploads/tenants/{id}/` | Media |
| `page_status` en stores | page_status tenant | ACTIVA/PAUSADA/... |
| OpenCage geocoding | dirección local en tenant_meta | Opcional landing |
| `platform_audit_log` | platform_audit_log admin | Super admin |
| `storeProvisioningService` | tenantProvisioningService | Referencia ops |
| `docs/RUNBOOK-BACKUP-RESTORE-TENANTS.md` | BACKUP-RESTORE.md | Prod |
| `docs/GUIA-02-SUPERADMIN-OPERACION-SAAS.md` | OPERATIONS.md | Super panel |
| Idempotency-Key pedidos | idempotency reservas/pagos | Anti duplicados |

---

## Subdominios apps (prod)

Carrito usa `api.`, `panel.`, `superpanel.` — TuTurno equivalente:

- `api.{BASE_DOMAIN}`
- `panel.{BASE_DOMAIN}`
- `admin.{BASE_DOMAIN}`

Tienda pública carrito usa path slug; TuTurno usa **subdominio tenant** (diferencia intencional).

---

## No copiar

- Esquema GOOTPV articulo/pedidos
- adminController monolítico 5000+ líneas
- express-session (solo JWT)

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
