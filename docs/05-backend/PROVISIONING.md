# Provisioning de tenants — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [04-datos/SCHEMA-ADMIN.md](../04-datos/SCHEMA-ADMIN.md) |
| Bloquea a | tenantProvisioningService |

---

## Flujo

```mermaid
flowchart TD
  A[POST /api/super/tenants] --> B[Validar slug único y reservado]
  B --> C[INSERT tenants status pending]
  C --> D[INSERT provisioning_run pending]
  D --> E[CREATE DATABASE tuturno_slug]
  E --> F[Ejecutar schema_tenant.sql]
  F --> G[INSERT tenant_meta + politicas default]
  G --> H[Crear usuario GERENTE]
  H --> I[INSERT tenant_user_index]
  I --> J[INSERT tenant_domains primary]
  J --> K[UPDATE provisioning_run success]
  K --> L[Audit log TENANT_CREATED]
```

---

## Errores

Cualquier fallo → provisioning_run status=error, error_message, tenant status permanece activo pero flag `provisioning_incomplete` en config_json o verificar db_name NULL.

Super admin puede POST reprovision.

---

## API

```typescript
async function provisionTenant(input: CreateTenantInput, requestedBy: number): Promise<Tenant>
```

---

## Idempotencia

Si BD ya existe → error claro; no sobrescribir.

---

## Seed opcional

Flag `seedDemoData: true` en create tenant → insert servicios/horarios demo.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
