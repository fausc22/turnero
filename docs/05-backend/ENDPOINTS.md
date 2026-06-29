# API Endpoints — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [ZOD-SCHEMAS.md](./ZOD-SCHEMAS.md), [ERROR-CODES.md](./ERROR-CODES.md) |
| Bloquea a | Routes backend |

Base URL dev: `http://api.localhost:4013`

Headers comunes:
- `x-tenant-slug`: obligatorio en public y tenant
- `Authorization: Bearer`: tenant y super routes
- `Content-Type: application/json`

---

## Health

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /health | — | `{ status: "ok" }` |

---

## Auth (panel)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login global email+password |
| POST | /api/auth/refresh | refresh | Nuevo access token |
| POST | /api/auth/logout | tenant | Invalidar refresh |
| GET | /api/auth/me | tenant | Usuario actual |

---

## API pública — /api/public/*

Sin JWT. Rate limit 60/min/IP/tenant.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /config | Meta, estilos, page_status, políticas públicas |
| GET | /servicios | Lista servicios activos + categorías |
| GET | /productos | Productos activos con stock > 0 |
| GET | /profesionales | Profesionales activos + servicios |
| GET | /disponibilidad | Query: fecha, servicioIds[], profesionalId? |
| POST | /reservas | Crear reserva |
| POST | /pagos/preference | Crear preferencia MP para turno |
| GET | /reservas/:token | Ver turno por token gestión |
| POST | /reservas/:token/cancelar | Cancelar |
| POST | /reservas/:token/reprogramar | Reprogramar |
| POST | /lista-espera | Alta lista espera |
| GET | /asset/:type | logo, hero, favicon |

### POST /reservas body

```json
{
  "servicioIds": [1, 2],
  "productos": [{ "productoId": 1, "cantidad": 1 }],
  "profesionalId": null,
  "fechaInicio": "2026-05-25T16:00:00",
  "cliente": { "nombre": "María", "telefono": "+5491123456789", "email": "m@mail.com" },
  "notas": "Fade bajo",
  "idempotencyKey": "uuid"
}
```

---

## API tenant — /api/tenant/*

JWT + x-tenant-slug + tenant match.

### Turnos

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| GET | /turnos | recep+ | Listar con filtros |
| GET | /turnos/:id | recep+ | Detalle |
| POST | /turnos | recep+ | Crear manual |
| PUT | /turnos/:id | recep+ | Actualizar |
| PATCH | /turnos/:id/estado | recep+ | Cambiar estado |
| DELETE | /turnos/:id | gerente | Eliminar (soft preferido) |

### Agenda

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /agenda | Query: from, to, profesionalId?, vista=day\|week |

### Clientes

| CRUD | /clientes |

### Servicios / Productos / Categorías

| CRUD | /servicios, /productos, /categorias-servicio |

### Profesionales

| CRUD | /profesionales |

### Horarios

| GET/PUT | /horarios-operativos |
| CRUD | /bloqueos |

### Config

| GET/PUT | /tenant-meta |
| GET/PUT | /tenant-estilos |
| GET/PUT | /politicas-reserva |

### Media

| POST | /media/upload |
| GET | /media/:type |

### Estadísticas

| GET | /estadisticas/resumen | Query: from, to |
| GET | /estadisticas/servicios-top |
| GET | /estadisticas/no-shows |

### Usuarios

| CRUD | /usuarios | gerente only |

### Notificaciones

| POST | /turnos/:id/reenviar-confirmacion |

### SSE

| GET | /events/stream |

### Pagos (panel)

| GET | /pagos | Listar |
| POST | /pagos/webhook | Público MP (sin tenant header — validar firma) |

---

## API super — /api/super/*

SUPER JWT only.

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/login | Super login |
| GET | /tenants | Listar |
| POST | /tenants | Crear + provision |
| GET | /tenants/:id | Detalle + last provisioning run |
| PUT | /tenants/:id | Actualizar plan, status, page_status |
| DELETE | /tenants/:id | Soft delete status=eliminado |
| POST | /tenants/:id/reprovision | Reintentar provisioning |
| GET | /audit-log | Auditoría plataforma |
| CRUD | /super-usuarios | Gestión super admins |

---

## Webhooks

| POST | /api/webhooks/mercadopago | Firma MP, resolver tenant por external_reference |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
