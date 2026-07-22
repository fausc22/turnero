# Staging runbook — TuTurno

| Campo | Valor |
|-------|-------|
| Última revisión | 2026-07-22 |

## Objetivo

Ensayar deploy, migraciones, restore y rollback en un entorno lo más parecido a producción, **sin datos reales de clientes**.

## Checklist

1. VPS/staging con Node 24, MySQL 8, PM2, reverse proxy + TLS.
2. Variables desde `backend/.env.example` (secretos propios de staging).
3. `LEGACY_API_ENABLED=false`, `RUN_CRONS_IN_API=false`, `DEV_UNLIMITED=false`.
4. `npm ci && npm run build && pm2 start ecosystem.config.cjs`
5. `npm run migrate -w backend -- apply`
6. Tenants sintéticos; MP sandbox; SMTP/WhatsApp controlados.
7. Ejecutar `./scripts/verify-baseline.sh` con DB (`CI_SKIP_DB=false`).
8. Playwright contra staging hosts.
9. `./ops/backup/backup.sh` + restore en host limpio + smoke.
10. Rollback: `pm2` a artifact anterior; DB solo roll-forward/restore.

## Criterio de salida

Dos ensayos consecutivos verdes con evidencia fechada (logs, MANIFEST, resultados de test).
