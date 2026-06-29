# Super panel — Pantallas

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [05-backend/PROVISIONING.md](../05-backend/PROVISIONING.md) |
| Bloquea a | panel-super routes |

---

## Login `/login`

- Email + password super admin
- POST /api/super/auth/login

---

## Tenants `/tenants`

Tabla: slug, nombre, plan, status, page_status, created_at, provisioning status

Acciones: ver, editar, suspender, reprovision

Filtros: status, plan, búsqueda nombre/slug

---

## Nuevo tenant `/tenants/nuevo`

Form:
- slug (validación live disponibilidad)
- nombre comercial
- plan
- email/nombre gerente
- password auto-generate checkbox
- seed demo data checkbox

Submit → provisioning async → redirect detalle

---

## Detalle tenant `/tenants/[id]`

- Info general editable
- Dominios (primary subdomain)
- Últimos provisioning runs (tabla)
- Link "Abrir panel" (impersonate token opcional fase 8)
- Botón suspender/activar

---

## Audit log `/audit`

Tabla platform_audit_log filtrable

---

## Super usuarios `/usuarios`

CRUD super admins (solo superadmin existente)

---

## Dashboard `/` (opcional)

- Total tenants activos
- Trials por vencer
- Turnos plataforma (sum aggregate job futuro)

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
