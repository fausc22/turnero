# Panel del local — Overview

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [NAVIGATION.md](./NAVIGATION.md) |
| Bloquea a | panel/ app |

---

## URL

`http://panel.localhost:4011`

Tenant resuelto por **JWT post-login**, no por subdominio.

---

## Auth flow

1. `/login` — email + password
2. API login global → tenantSlug en response
3. Guardar tokens + tenant en localStorage/context
4. Todas requests: Authorization + x-tenant-slug

---

## Layout

- Sidebar colapsable (icon-only mobile)
- Topbar: nombre local, usuario, logout
- Content area scroll
- Dark theme consistente con design system

---

## Diferencia vs legacy

Legacy `frontend/app/admin` sin sidebar, sin edit, sin agenda calendario → reemplazar completamente en `panel/`.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
