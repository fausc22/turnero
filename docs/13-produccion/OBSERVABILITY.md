# Observabilidad mínima — TuTurno

| Campo | Valor |
|-------|-------|
| Última revisión | 2026-07-22 |

## Endpoints

| Ruta | Uso |
|------|-----|
| `GET /health` / `/health/live` | Liveness (proceso) |
| `GET /health/ready` | Readiness (ping admin DB) |

Proxy/LB debe usar **ready** para tráfico.

## Logs

- JSON a stdout + archivos `backend/logs/`
- `x-request-id` en respuestas
- Redacción de emails, teléfonos, JWT, paths de reserva

## Alertas mínimas

1. Ready 503 > 2 min
2. API/worker/scheduler PM2 down
3. Disco > 85%
4. Backup verify fallido o LATEST > 26h
5. Certificado TLS < 14 días
6. Tasa 5xx > umbral (p. ej. 5% / 5 min)
7. `notification_jobs` en `processing`/`failed` creciendo

## Métricas locales

- Tabla `scheduler_heartbeats` (última ejecución / error)
- `pm2 monit` / `pm2 logs`
- Contadores cola: `SELECT status, COUNT(*) FROM notification_jobs GROUP BY status`
