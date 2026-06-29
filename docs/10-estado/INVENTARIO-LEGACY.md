# Inventario código legacy — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [GAPS.md](./GAPS.md), [03-stack/REUSE-TURNERO-LEGACY.md](../03-stack/REUSE-TURNERO-LEGACY.md) |
| Bloquea a | Plan migración |

---

## Resumen

| Área | Archivos | Estado general |
|------|----------|----------------|
| Backend | 39 TS | Parcial — auth tenant roto para público |
| Frontend | ~25 fuente | Parcial — slug path, admin sin nav |
| Data | schema.sql, seed.sql | Bueno como base tenant |
| Docs legacy | backend/README, frontend/README | Desactualizados |
| Infra | sin git, sin docker, sin tests | Pendiente |

---

## Backend

| Archivo | Estado | Acción |
|---------|--------|--------|
| `backend/src/index.ts` | LEGACY | Refactor entry, workers |
| `backend/src/app.ts` | LEGACY | Split routes public/tenant/super |
| `backend/src/config/database.ts` | LEGACY | Multi-tenant pool + USE |
| `backend/src/config/logger.ts` | HECHO | Conservar |
| `backend/src/middlewares/auth.ts` | LEGACY | Tenant match, SUPER split |
| `backend/src/middlewares/validate.ts` | HECHO | Conservar |
| `backend/src/middlewares/errorHandler.ts` | LEGACY | AppError codes |
| `backend/src/middlewares/audit.ts` | PENDIENTE | Montar en routes |
| `backend/src/controllers/authController.ts` | LEGACY | Login global |
| `backend/src/controllers/barberiaController.ts` | LEGACY | → super tenants |
| `backend/src/controllers/*Controller.ts` | LEGACY | Adaptar sin barberiaId |
| `backend/src/services/turnoService.ts` | PARCIAL | Core lógica reusable |
| `backend/src/services/mercadoPagoService.ts` | PARCIAL | Adaptar refs tenant |
| `backend/src/repositories/horarioRepository.ts` | PARCIAL | Sin API expuesta |
| `backend/src/repositories/auditRepository.ts` | PENDIENTE | No wired |
| `backend/src/types/index.ts` | LEGACY | Regenerar types |
| `backend/src/utils/*` | PARCIAL | jwt, password OK |

---

## Frontend

| Archivo | Estado | Acción |
|---------|--------|--------|
| `frontend/app/page.tsx` | LEGACY | Eliminar listado barberías |
| `frontend/app/[slug]/page.tsx` | LEGACY | Reescribir subdominio |
| `frontend/app/[slug]/reservar/page.tsx` | ROTO | Auth mismatch; horarios hardcoded |
| `frontend/app/admin/*` | PARCIAL | Migrar a panel/ |
| `frontend/app/login/page.tsx` | PARCIAL | Migrar a panel/ |
| `frontend/context/AuthContext.tsx` | LEGACY | Tenant + refresh |
| `frontend/context/BarberiaContext.tsx` | LEGACY | → TenantContext host |
| `frontend/hooks/use*.ts` | LEGACY | → TanStack Query |
| `frontend/services/api/*` | LEGACY | x-tenant-slug interceptor |
| `frontend/components/ui/*` | HECHO | Base shadcn — restyle dark |

---

## Data

| Archivo | Estado | Acción |
|---------|--------|--------|
| `data/schema.sql` | PARCIAL | → schema_tenant.sql |
| `data/seed.sql` | PARCIAL | → seed_dev.sql multi-tenant |

---

## No existe aún

- `panel/`, `panel-super/`
- `data/schema_admin.sql`
- `ecosystem.config.cjs`
- `docs/` (ahora HECHO)
- Tests
- `.env.example`
- Git repo

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
