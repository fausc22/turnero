# Fase 0 — Scaffold

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Tareas | T-001 – T-020 |
| Relacionado con | [12-dev-local/SETUP.md](../12-dev-local/SETUP.md) |

---

## Objetivo

Fundación monorepo: BD admin, middleware tenant, 4 apps arrancando, hosts locales.

## Entregables

- `data/schema_admin.sql`, `schema_tenant.sql`
- Backend refactor: tenant middleware, AppError, route prefixes
- `panel/`, `panel-super/` scaffold
- `frontend/` middleware subdominio, sin `[slug]`
- `ecosystem.config.cjs`
- git init + .gitignore

## Verificación

```bash
# Tras completar fase
curl http://api.localhost:4013/health
# Abrir panel.localhost:4011, admin.localhost:4012, peluqueria-naz.localhost:4010
```

## Siguiente fase

[PHASE-1-DATA-PROVISIONING.md](./PHASE-1-DATA-PROVISIONING.md)
