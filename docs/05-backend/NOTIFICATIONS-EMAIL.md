# Notificaciones Email — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [NOTIFICATIONS-WHATSAPP.md](./NOTIFICATIONS-WHATSAPP.md) |
| Bloquea a | emailService |

---

## Transport

Nodemailer con SMTP configurable en backend `.env`:

```
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
```

Dev: Mailtrap o Ethereal fake SMTP.

---

## Templates HTML

Minimal dark inline CSS (compatible email clients):

- confirmacion.html
- cancelacion.html
- recordatorio.html

Incluir: logo tenant (URL pública asset), fecha/hora, dirección, botón "Gestionar turno".

---

## Cuándo enviar

| Evento | Condición |
|--------|-----------|
| Confirmación | Email provisto + (WhatsApp off OR fallback) |
| Recordatorio 24h | Email provisto |
| Cancelación | Siempre si email |

---

## Misma cola que WhatsApp

`NotificationJob.canal = 'email' | 'whatsapp'`

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
