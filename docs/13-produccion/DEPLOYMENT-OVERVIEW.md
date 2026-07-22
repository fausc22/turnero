# Deployment overview — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-07-22 |
| Relacionado con | [PRODUCTION-RUNBOOK.md](./PRODUCTION-RUNBOOK.md), [STAGING-RUNBOOK.md](./STAGING-RUNBOOK.md) |

---

## Arquitectura prod

| Componente | URL / proceso |
|------------|----------------|
| API | https://api.{BASE_DOMAIN} — `tuturno-api` (1 instancia) |
| Scheduler | `tuturno-scheduler` (único; crons) |
| Worker | `tuturno-worker` (notificaciones) |
| Panel | https://panel.{BASE_DOMAIN} |
| Super | https://admin.{BASE_DOMAIN} |
| Cliente | https://{slug}.{BASE_DOMAIN} |

Infra: VPS + Nginx/Caddy + PM2 + MySQL 8 + wildcard TLS.

## Runbooks

1. [BASELINE.md](./BASELINE.md)
2. [STAGING-RUNBOOK.md](./STAGING-RUNBOOK.md)
3. [PRODUCTION-RUNBOOK.md](./PRODUCTION-RUNBOOK.md)
4. [BACKUP-RESTORE.md](./BACKUP-RESTORE.md)
5. [SMOKE-TESTS.md](./SMOKE-TESTS.md)
6. [OBSERVABILITY.md](./OBSERVABILITY.md)

## Guardrails

- `LEGACY_API_ENABLED=false`
- `RUN_CRONS_IN_API=false`
- `DEV_UNLIMITED=false`
- Secrets JWT ≥ 32 chars (fail-fast)
- Migraciones: `npm run migrate -w backend -- apply`
