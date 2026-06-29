# Reutilización — planificador

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [02-arquitectura/MULTITENANCY.md](../02-arquitectura/MULTITENANCY.md) |
| Bloquea a | Backend scaffold |

---

## Mapa archivo → TuTurno

| Origen planificador | Destino TuTurno | Notas |
|---------------------|-----------------|-------|
| `backend/middlewares/tenant.js` | `backend/src/middlewares/tenant.ts` | Port a TS; slug header |
| `backend/services/tenantProvisioningService.js` | `backend/src/services/tenantProvisioningService.ts` | Adaptar schema SQL |
| `backend/middlewares/validateZod.js` | `backend/src/middlewares/validate.ts` | Ya existe parcial en legacy |
| `backend/utils/AppError.js` | `backend/src/utils/errors.ts` | Extender códigos |
| `backend/middlewares/errorHandler.js` | `backend/src/middlewares/errorHandler.ts` | Mejorar |
| `data/schema_planificador_admin.sql` | `data/schema_admin.sql` | Renombrar tablas |
| `data/schema_planificador_base.sql` | base para `schema_tenant.sql` | Dominio turnos |
| `ecosystem.config.cjs` | `ecosystem.config.cjs` | Puertos 4010–4013 |
| `backend/tests/integration/*` | `backend/tests/integration/*` | Patrón tests |
| `frontend/utils/api.js` (x-tenant-slug) | `panel/lib/api.ts` | Interceptor |
| `backend/controllers/superAdminController.js` | `backend/src/controllers/super/*` | CRUD tenants |
| `docs/QA_PRE_PRODUCCION.md` | inspiración `QA-CHECKLIST-LOCAL.md` | — |

---

## Patrones clave a copiar

1. **JWT tenant_slug mismatch** → 403
2. **tenant_user_index** para login global
3. **tenant_provisioning_runs** auditoría
4. **config_json** flexible en tenants
5. **SUPER_JWT_SECRET** separado
6. **Zod end-to-end**

---

## No copiar

- Tablas anuales `logueo_YYYY` (dominio RRHH)
- Marcaciones QR/geo
- Puppeteer recibos PDF

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
