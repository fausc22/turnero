# Archivos y media — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [09-ui-ux/TENANT-BRANDING.md](../09-ui-ux/TENANT-BRANDING.md) |
| Bloquea a | Upload endpoints, personalización panel |

---

## Estructura de almacenamiento

Patrón **carrito** adaptado:

```
uploads/
  tenants/
    {tenantId}/
      favicon.ico
      logo.png
      hero.jpg
      profesionales/
        {profesionalId}.jpg
```

- Desarrollo: filesystem local
- Prod futuro: mismo path en VPS o S3-compatible

---

## Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/tenant/media/upload` | gerente | multipart: type=logo\|hero\|favicon |
| GET | `/api/public/asset/:type` | público | Sirve asset; header x-tenant-slug |
| GET | `/api/tenant/media/:type` | tenant | Preview panel |

Tipos: `favicon`, `logo`, `hero`, `profesional/{id}`

---

## Validación upload

- Max size: 2MB logo/favicon, 5MB hero
- MIME: image/jpeg, image/png, image/webp
- Procesar con **sharp**: resize logo max 400px, hero max 1920px

---

## URLs en BD

`tenant_meta` / `estilos`:

```json
{
  "logo_path": "tenants/1/logo.png",
  "logo_url": "/api/public/asset/logo"  // relativo, resuelto con tenant header
}
```

No guardar URLs absolutas hardcodeadas.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
