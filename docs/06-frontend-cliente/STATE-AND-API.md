# Frontend cliente — Estado y API

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [05-backend/ENDPOINTS.md](../05-backend/ENDPOINTS.md) |
| Bloquea a | lib/api.ts, hooks |

---

## TenantContext

```typescript
interface TenantContextValue {
  slug: string;
  config: PublicConfig | null;
  isLoading: boolean;
}
```

Provider carga `GET /api/public/config` al mount.

---

## TanStack Query keys

```typescript
['tenant', slug, 'config']
['tenant', slug, 'servicios']
['tenant', slug, 'profesionales']
['tenant', slug, 'disponibilidad', fecha, servicioIds, profesionalId]
```

staleTime config: 5 min. disponibilidad: 0 (always fresh).

---

## Axios interceptor

```typescript
api.interceptors.request.use(config => {
  const slug = getTenantSlugFromHost();
  if (slug) config.headers['x-tenant-slug'] = slug;
  return config;
});
```

---

## Mutations

- `useCreateReserva` → POST /reservas, onSuccess redirect
- `useCreatePaymentPreference` → redirect MP

---

## Idempotency

Generar `uuid v4` al iniciar paso 5; reusar en submit.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
