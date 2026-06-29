# Subdominios y routing — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [MULTITENANCY.md](./MULTITENANCY.md), [12-dev-local/HOSTS-LOCAL.md](../12-dev-local/HOSTS-LOCAL.md) |
| Bloquea a | Middleware Next.js, CORS, SSL prod |

---

## Decisión: subdominio, no path slug

| Entorno | Cliente final | Panel | Super | API |
|---------|---------------|-------|-------|-----|
| Dev | `{slug}.localhost:4010` | `panel.localhost:4011` | `admin.localhost:4012` | `api.localhost:4013` |
| Prod | `{slug}.{BASE_DOMAIN}` | `panel.{BASE_DOMAIN}` | `admin.{BASE_DOMAIN}` | `api.{BASE_DOMAIN}` |

**No se usa** `tuturno.com/{slug}` como ruta principal. Opcional redirect 301 en prod futuro.

El **slug interno** en BD coincide con el subdominio del tenant (normalizado: lowercase, guiones, sin acentos).

---

## Subdominios reservados

```
panel, admin, api, www, mail, ftp, app, static, cdn
```

Validación al crear tenant en super panel. Regex slug: `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$`

---

## Resolución en frontend cliente

**Next.js middleware** (`frontend/middleware.ts`):

```typescript
// Pseudocódigo
const host = request.headers.get('host') ?? '';
const slug = extractTenantSlug(host); // peluqueria-naz.localhost → peluqueria-naz
if (!slug || isReserved(slug)) {
  return NextResponse.redirect('https://panel.localhost:4011'); // o landing marketing
}
request.headers.set('x-tenant-slug', slug);
```

- No hay segmento dinámico `[slug]` en rutas
- Rutas: `/`, `/reservar`, `/confirmacion`, `/pago/*`, `/gestionar/[token]`

---

## Resolución en backend

Orden de resolución tenant:

1. Header `x-tenant-slug` (obligatorio en `/api/tenant/*` y `/api/public/*`)
2. Para rutas públicas desde frontend: el cliente axios/fetch setea header desde host
3. Lookup en `tuturno_admin.tenants` por slug
4. Verificar `status = activo`
5. `USE tuturno_{slug}` en conexión pool

**JWT tenant:** validar que `token.tenant_slug === header x-tenant-slug` (patrón planificador).

---

## CORS

```javascript
const allowedOrigins = [
  /^https?:\/\/[\w-]+\.localhost(:\d+)?$/,
  /^https?:\/\/panel\.localhost(:\d+)?$/,
  /^https?:\/\/admin\.localhost(:\d+)?$/,
  // prod: /^https:\/\/[\w-]+\.{BASE_DOMAIN}$/  etc.
];
```

---

## Cookies

Panel en `panel.localhost` — cookies auth con `domain` no compartido con tenant subdomains (seguridad). Cliente final sin cookies auth.

---

## Wildcard SSL (prod futuro)

Certificado `*.{BASE_DOMAIN}` + certificados para `panel`, `admin`, `api`.

Documentado en [13-produccion/DEPLOYMENT-OVERVIEW.md](../13-produccion/DEPLOYMENT-OVERVIEW.md).

---

## Tabla tenant_domains (control plane)

Permite alias futuros sin cambiar slug:

| Campo | Ejemplo |
|-------|---------|
| tenant_id | 1 |
| domain | peluqueria-naz.localhost |
| is_primary | true |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
