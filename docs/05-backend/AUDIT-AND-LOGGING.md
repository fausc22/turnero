# Auditoría y logging — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [PROVISIONING.md](./PROVISIONING.md) |
| Bloquea a | audit middleware, winston |

---

## Winston (backend)

```
logs/
├── combined.log
├── error.log
└── exceptions.log
```

Formato JSON en prod; pretty en dev.

---

## Auditoría tenant

Tabla `auditoria` en BD tenant.

Middleware opcional en rutas mutating:

```typescript
auditLog({ accion: 'TURNO_UPDATED', entidad: 'turno', entidadId })
```

Campos: usuario_id, datos_previos, datos_nuevos JSON.

---

## Auditoría plataforma

Tabla `platform_audit_log` en admin.

Eventos: TENANT_CREATED, TENANT_SUSPENDED, TENANT_PLAN_CHANGED, SUPER_LOGIN_FAILED

---

## Qué auditar obligatorio

- Cambios políticas_reserva / mp_access_token
- Cambios estado turno manual
- CRUD usuarios panel
- Acciones super admin

---

## Legacy

`backend/src/middlewares/audit.ts` y `auditRepository.ts` existen pero no montados — implementar en nueva arquitectura.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
