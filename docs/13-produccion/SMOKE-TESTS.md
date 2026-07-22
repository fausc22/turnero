# Smoke tests de producción (no destructivos)

## Reglas

- Solo tenant interno `smoke-*` / datos prefijados `SMOKE_`
- Emails/teléfonos controlados
- MP test o operación autorizada
- Sin carga agresiva; sin deletes masivos
- Idempotentes cuando sea posible

## Checklist

1. `GET /health/live` → 200
2. `GET /health/ready` → 200
3. Login panel tenant smoke
4. Login super-admin
5. Crear reserva pública `SMOKE_` (slot lejano)
6. Si pagos: preferencia MP sandbox + webhook test
7. SSE panel recibe evento o reconnect
8. Asset logo `?slug=smoke-tenant` → 200
9. Worker: job pending→sent o failed accionable
10. Cleanup: cancelar reserva smoke por token firmado (IDs explícitos)

## Abortar si

- Cross-tenant data leak
- Pago confirma con monto incorrecto
- Ready falla
- Backup verify falla
