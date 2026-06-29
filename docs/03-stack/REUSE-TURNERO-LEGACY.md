# Reutilización — turnero legacy

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [10-estado/INVENTARIO-LEGACY.md](../10-estado/INVENTARIO-LEGACY.md) |
| Bloquea a | Migración código |

---

## Conservar (adaptar)

| Archivo | Uso |
|---------|-----|
| `backend/src/services/turnoService.ts` | Lógica overlap, bloqueos, transacciones — quitar barberiaId param, usar tenant context |
| `backend/src/repositories/horarioRepository.ts` | Queries horarios/bloqueos |
| `backend/src/repositories/turnoRepository.ts` | CRUD turnos |
| `backend/src/services/mercadoPagoService.ts` | Preferencias MP |
| `backend/src/utils/jwt.ts`, `password.ts` | Auth base |
| `backend/src/middlewares/validate.ts` | Zod middleware |
| `data/schema.sql` | Base para schema_tenant |
| `frontend/components/ui/*` | shadcn base (actualizar a design system) |
| `frontend/lib/validations.ts` | Schemas Zod cliente |
| `frontend/hooks/useTurnos.ts` etc. | Patrón hooks → migrar a TanStack Query |

---

## Reescribir

| Archivo | Razón |
|---------|-------|
| `frontend/app/[slug]/*` | Subdominio, no path |
| `frontend/app/admin/*` | Mover a panel/ |
| `backend/src/routes/*` | Split public/tenant/super |
| `backend/src/middlewares/auth.ts` | Tenant match, roles nuevos |
| `backend/src/config/database.ts` | Pool + USE per tenant |
| `context/BarberiaContext` | TenantContext + host header |

---

## Eliminar

| Item | Razón |
|------|-------|
| Referencias barbería en copy UI | Producto genérico "local" |
| `barberia_id` en todas las tablas tenant | Una BD por tenant |
| Rutas pago sin implementar referenciadas | Implementar completo |
| Zustand no usado | Remover dep o usar |
| Listado home barberías | No aplica subdominio directo |

---

## Seed legacy

`data/seed.sql` — Nazareno Hairdressing → migrar a seed_dev con 2 tenants.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
