# Autenticación y roles — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [07-panel/ROLES-PERMISSIONS.md](../07-panel/ROLES-PERMISSIONS.md), [05-backend/ENDPOINTS.md](../05-backend/ENDPOINTS.md) |
| Bloquea a | Auth middleware, panel login, super panel |

---

## Tipos de auth

| Contexto | Mecanismo | Secret |
|----------|-----------|--------|
| API pública | Sin auth; rate limit | — |
| Panel local | JWT access + refresh | `JWT_SECRET` |
| Super panel | JWT access + refresh | `SUPER_JWT_SECRET` |
| Token reserva cliente | HMAC signed URL | `RESERVATION_TOKEN_SECRET` |

---

## JWT tenant (panel)

Payload:

```json
{
  "sub": "usuario_id",
  "tenant_id": 1,
  "tenant_slug": "peluqueria-naz",
  "rol": "gerente",
  "email": "admin@local.com",
  "iat": 0,
  "exp": 0
}
```

- Access TTL: 15 min
- Refresh TTL: 7 días (30 con remember me)
- Header: `Authorization: Bearer {token}`
- Obligatorio: `x-tenant-slug` debe coincidir con `tenant_slug` del token

Middleware chain tenant routes:

```
resolveTenant → authenticate → requireTenantMatch → requireRole(...)
```

---

## Login global (sin slug en URL)

Patrón planificador `tenant_user_index`:

```
POST /api/auth/login
Body: { email, password, rememberMe? }

1. SELECT tenant_id, tenant_slug FROM tenant_user_index WHERE email = ?
2. USE tuturno_{slug}
3. Verificar password usuarios
4. Emitir JWT + refresh
5. Return { token, refreshToken, tenantSlug, usuario }
```

Panel redirige a dashboard; tenant slug guardado en contexto (no en URL).

---

## SUPER JWT

Payload:

```json
{
  "sub": "super_usuario_id",
  "rol": "superadmin",
  "email": "owner@tuturno.com"
}
```

Rutas `/api/super/*` — **rechazan** JWT tenant y viceversa.

---

## Roles tenant

| Rol | Enum BD |
|-----|---------|
| gerente | GERENTE |
| recepcionista | RECEPCIONISTA |
| profesional | PROFESIONAL |

Legacy `ADMIN_BARBERIA` → `GERENTE`, `BARBERO` → `PROFESIONAL`.

Super admin **no** existe en BD tenant.

---

## Refresh flow

```
POST /api/auth/refresh
Headers: Authorization (refresh) o body { refreshToken }
→ nuevo access token
```

Frontend axios interceptor (patrón turnero legacy + planificador).

---

## Password

bcrypt cost 12. Política mínima: 8 caracteres.

---

## Seguridad adicional

- Rate limit login: 5 intentos / 15 min por IP+email
- Log intentos fallidos en audit
- `DEV_UNLIMITED` nunca en prod

---

## API pública

Sin JWT. Opcional CAPTCHA en prod. Rate limit: 60 req/min por IP por tenant.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
