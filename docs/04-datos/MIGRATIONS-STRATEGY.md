# Estrategia de migraciones — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [SCHEMA-ADMIN.md](./SCHEMA-ADMIN.md) |
| Bloquea a | Scripts setup |

---

## Enfoque

SQL versionado manual en `/data` (patrón planificador/carrito, sin ORM migrations v1).

```
data/
├── schema_admin.sql          # Estado completo admin
├── schema_tenant.sql         # Estado completo tenant
├── seed_dev.sql              # Datos demo
└── migrations/
    ├── 001_initial.sql
    └── README.md             # Log de cambios incrementales
```

---

## Scripts backend

| Script | Comando npm | Acción |
|--------|-------------|--------|
| setup-admin-db.ts | setup:admin | Crea tuturno_admin + schema |
| provision-tenant.ts | provision --slug=x | Crea tuturno_x + schema |
| seed-dev.ts | seed:dev | Super admin + 2 tenants demo |

---

## Provisioning nuevo tenant

Siempre usar servicio `tenantProvisioningService`, nunca SQL manual en prod.

Pasos idempotentes donde sea posible.

---

## Cambios schema en tenants existentes

1. Agregar migration SQL en `/data/migrations/NNN_descripcion.sql`
2. Script `migrate-all-tenants.ts` itera `tenants WHERE status=activo`
3. Ejecutar migration en cada `db_name`
4. Registrar en log

---

## Legacy turnero

No migrar BD shared `turnero` — crear tenants frescos desde schema_tenant.sql. Datos seed reimportados manualmente si necesario.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
