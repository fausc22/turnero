# Post-deploy report — plantilla

| Campo | Valor |
|-------|-------|
| Release / commit | |
| Fecha/hora deploy | |
| Operador | |

## Observación 24/48h

| Check | 1h | 4h | 24h | 48h |
|-------|----|----|-----|-----|
| Ready OK | | | | |
| 5xx / latencia | | | | |
| Jobs / cola | | | | |
| Backup verify | | | | |
| Smoke OK | | | | |
| Incidentes | | | | |

## Decisión

- [ ] Mantener piloto
- [ ] Ampliar tenants
- [ ] Rollback / freeze

## Backlog diferido (no mezclar en cierre)

- Refresh HttpOnly + CSRF
- SSE pub/sub
- Reemplazo Baileys RC
- Outbox transaccional
