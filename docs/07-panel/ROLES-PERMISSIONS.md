# Panel — Roles y permisos

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [01-producto/BUSINESS-RULES.md](../01-producto/BUSINESS-RULES.md) |
| Bloquea a | auth middleware, panel guards |

---

## Roles

| Rol | Descripción |
|-----|-------------|
| GERENTE | Acceso total tenant |
| RECEPCIONISTA | Operación día a día |
| PROFESIONAL | Solo agenda propia |

---

## Matriz permisos API

Implementar `requireRole('GERENTE' | 'RECEPCIONISTA' | ...)` en routes.

| Recurso | GERENTE | RECEPCIONISTA | PROFESIONAL |
|---------|:-------:|:-------------:|:-----------:|
| GET turnos | all | all | own |
| POST turnos | ✓ | ✓ | — |
| PUT servicios | ✓ | — | — |
| PUT politicas | ✓ | — | — |
| GET estadisticas | ✓ | ✓ | — |
| CRUD usuarios | ✓ | — | — |

---

## Frontend guards

Hook `useCan(action)` + hide nav items sin permiso.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
