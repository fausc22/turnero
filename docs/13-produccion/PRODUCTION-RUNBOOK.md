# Production runbook — TuTurno (piloto controlado)

| Campo | Valor |
|-------|-------|
| Última revisión | 2026-07-22 |

## Pre-deploy

- [ ] CI verde del commit exacto
- [ ] Ventana y owner definidos
- [ ] Backup fresco + `verify.sh` OK
- [ ] `migrate plan` sin checksum mismatch
- [ ] Tenant smoke interno creado (`smoke-*`)
- [ ] `LEGACY_API_ENABLED=false`, `DEV_UNLIMITED=false`, secrets ≥32
- [ ] `MP_WEBHOOK_SECRET` configurado si hay pagos
- [ ] Abort gates claros (fuga tenant, pagos erróneos, ready rojo)

## Deploy (orden)

1. `./ops/backup/backup.sh`
2. `npm run migrate -w backend -- apply`
3. Build + deploy artifact
4. `pm2 restart tuturno-scheduler tuturno-worker tuturno-api tuturno-web tuturno-panel tuturno-admin`
5. Verificar `/health/ready`
6. Smoke tests ([SMOKE-TESTS.md](./SMOKE-TESTS.md))

## Post-deploy

- Monitoreo 1h / 4h / 24h / 48h
- Confirmar siguiente backup
- Registrar incidente o go/no-go

## Rollback

1. Declarar incidente; pausar canary/tenant afectado
2. Pausar scheduler/worker si agravan datos
3. Restaurar artifact PM2 anterior
4. No revertir DDL automáticamente — roll-forward o restore autorizado
5. Repetir ready + smoke
