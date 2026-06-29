# Diagrama ER — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [SCHEMA-ADMIN.md](./SCHEMA-ADMIN.md), [SCHEMA-TENANT.md](./SCHEMA-TENANT.md) |
| Bloquea a | Implementación repositories |

---

## Control plane (tuturno_admin)

```mermaid
erDiagram
  super_usuarios ||--o{ tenant_provisioning_runs : requests
  tenants ||--o{ tenant_provisioning_runs : has
  tenants ||--o{ tenant_domains : has
  tenants ||--o{ tenant_user_index : has
  super_usuarios ||--o{ platform_audit_log : performs
```

---

## Data plane (tuturno_slug)

```mermaid
erDiagram
  clientes ||--o{ turnos : books
  profesionales ||--o{ turnos : assigned
  turnos ||--|{ turno_servicios : includes
  servicios ||--o{ turno_servicios : in
  turnos ||--o{ turno_productos : includes
  productos ||--o{ turno_productos : in
  turnos ||--o{ pagos : paid_by
  clientes ||--o| membresias : has
  categorias_servicio ||--o{ servicios : groups
  profesionales ||--o{ profesional_servicios : performs
  servicios ||--o{ profesional_servicios : linked
  usuarios }o--|| profesionales : optional_link
  clientes ||--o{ lista_espera : waits
  turnos ||--o{ notificaciones_enviadas : notifies
```

---

## Relaciones clave

| Relación | Cardinalidad | Regla |
|----------|--------------|-------|
| turno → cliente | N:1 | Obligatorio |
| turno → profesional | N:1 | Opcional si "cualquiera" |
| turno → servicios | N:M | Al menos 1 servicio |
| profesional → servicios | N:M | Define quién puede hacer qué |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
