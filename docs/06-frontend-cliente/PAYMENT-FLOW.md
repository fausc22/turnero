# Frontend cliente — Flujo de pago

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [05-backend/PAYMENTS-MERCADOPAGO.md](../05-backend/PAYMENTS-MERCADOPAGO.md) |
| Bloquea a | pago pages |

---

## Secuencia

1. Reserva creada PENDIENTE
2. POST preference → `{ initPoint }`
3. `window.location.href = initPoint` (full redirect MP)
4. MP redirect back_urls con query turno id
5. Página `/pago/exito` poll GET turno hasta CONFIRMADO o timeout
6. Redirect `/confirmacion/[id]`

---

## SDK MP

Opcional Wallet Brick; v1 usar redirect init_point (más simple, patrón legacy turnero).

---

## Sin pago

Skip paso MP; POST reservas retorna CONFIRMADO directo.

---

## Errores

- preference fail → toast + retry
- pago rechazado → `/pago/error` con link reintentar preference

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
