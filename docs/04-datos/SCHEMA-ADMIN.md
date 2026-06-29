# Schema control plane — tuturno_admin

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [SCHEMA-TENANT.md](./SCHEMA-TENANT.md), [05-backend/PROVISIONING.md](../05-backend/PROVISIONING.md) |
| Bloquea a | data/schema_admin.sql |

---

## Base de datos

`CREATE DATABASE tuturno_admin`

---

## Tabla: super_usuarios

Usuarios del panel super admin.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | INT PK AI | |
| email | VARCHAR(255) UNIQUE | |
| nombre | VARCHAR(255) | |
| password_hash | VARCHAR(255) | bcrypt |
| rol | ENUM('superadmin') | |
| activo | TINYINT(1) | |
| created_at | DATETIME | |

---

## Tabla: tenants

| Columna | Tipo | Notas |
|---------|------|-------|
| id | INT PK AI | |
| slug | VARCHAR(100) UNIQUE | = subdominio |
| nombre | VARCHAR(255) | Nombre comercial |
| db_name | VARCHAR(100) | tuturno_{slug} |
| plan | ENUM('trial','basico','profesional','enterprise') | |
| status | ENUM('activo','suspendido','eliminado') | |
| page_status | ENUM('ACTIVA','PAUSADA','MANTENIMIENTO','BLOQUEADA') | |
| trial_ends_at | DATETIME NULL | |
| config_json | JSON | branding, features, timezone |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### config_json ejemplo

```json
{
  "timezone": "America/Argentina/Buenos_Aires",
  "color_primario": "#6366f1",
  "whatsapp_habilitado": true,
  "features": {
    "mercadopago": true,
    "lista_espera": true,
    "max_profesionales": 10
  }
}
```

---

## Tabla: tenant_user_index

Login global panel.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | INT PK AI | |
| tenant_id | INT FK tenants | |
| tenant_slug | VARCHAR(100) | denormalizado |
| email | VARCHAR(255) UNIQUE | |
| usuario_id | INT | ID en BD tenant |
| updated_at | DATETIME | |

---

## Tabla: tenant_domains

| Columna | Tipo | Notas |
|---------|------|-------|
| id | INT PK AI | |
| tenant_id | INT FK | |
| domain | VARCHAR(255) UNIQUE | peluqueria-naz.localhost |
| is_primary | TINYINT(1) | |

---

## Tabla: tenant_provisioning_runs

| Columna | Tipo | Notas |
|---------|------|-------|
| id | INT PK AI | |
| tenant_id | INT FK | |
| status | ENUM('pending','success','error') | |
| error_message | TEXT | |
| started_at | DATETIME | |
| finished_at | DATETIME | |
| requested_by | INT FK super_usuarios | |

---

## Tabla: platform_audit_log

| Columna | Tipo | Notas |
|---------|------|-------|
| id | BIGINT PK AI | |
| super_usuario_id | INT NULL | |
| action | VARCHAR(100) | TENANT_CREATED, TENANT_SUSPENDED |
| entity_type | VARCHAR(50) | tenant |
| entity_id | INT | |
| payload_json | JSON | |
| created_at | DATETIME | |

---

## Índices clave

- tenants(slug), tenants(status)
- tenant_user_index(email)
- tenant_domains(domain)

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
