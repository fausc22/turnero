# Códigos de error — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [ENDPOINTS.md](./ENDPOINTS.md) |
| Bloquea a | AppError, errorHandler |

---

## Formato respuesta error

```json
{
  "error": {
    "code": "SLOT_TAKEN",
    "message": "El horario seleccionado ya no está disponible",
    "details": {}
  }
}
```

---

## Códigos

| HTTP | Code | Descripción |
|------|------|-------------|
| 400 | VALIDATION_ERROR | Zod falló |
| 400 | NO_TENANT_SLUG | Falta header |
| 401 | UNAUTHORIZED | Token inválido |
| 401 | INVALID_CREDENTIALS | Login fallido |
| 403 | FORBIDDEN | Rol insuficiente |
| 403 | TENANT_MISMATCH | JWT slug ≠ header |
| 403 | TENANT_SUSPENDED | Tenant suspendido |
| 403 | TENANT_NOT_ACTIVE | page_status bloquea |
| 403 | PLAN_LIMIT_PROFESIONALES | Límite plan |
| 403 | PLAN_LIMIT_TURNOS | Límite mensual |
| 403 | FEATURE_NOT_AVAILABLE | Feature flag off |
| 404 | TENANT_NOT_FOUND | Slug no existe |
| 404 | NOT_FOUND | Recurso genérico |
| 409 | SLOT_TAKEN | Overlap turno |
| 409 | STOCK_INSUFICIENTE | Producto sin stock |
| 409 | DUPLICATE_EMAIL | Usuario panel |
| 422 | CANCELATION_NOT_ALLOWED | Fuera ventana cancelación |
| 422 | REPROGRAM_LIMIT_EXCEEDED | Max reprogramaciones |
| 429 | RATE_LIMIT | Demasiados requests |
| 500 | INTERNAL_ERROR | Error no controlado |

---

## Clase AppError

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) { super(message); }
}
```

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
