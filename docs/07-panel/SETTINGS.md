# Panel — Configuración

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [05-backend/PAYMENTS-MERCADOPAGO.md](../05-backend/PAYMENTS-MERCADOPAGO.md) |
| Bloquea a | panel/configuracion |

---

## Secciones

### Datos del local
nombre, email, teléfono, dirección (+ geocode button OpenCage opcional)

### Políticas reserva
anticipación min/max, cancelación, buffer, granularidad slots

### Pagos Mercado Pago
- mp_access_token (masked input)
- modo_pago select
- seña % o monto
- test connection button

### WhatsApp
- toggle habilitado
- estado conexión Baileys (connected/disconnected)
- botón reconectar QR (dev)

### Notificaciones
- toggles recordatorio 24h / 2h
- edit plantillas (link modal)

### page_status
Radio ACTIVA / PAUSADA (gerente; BLOQUEADA solo super)

---

## Validación

Zod en submit; toast éxito/error.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
