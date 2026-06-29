# Notificaciones WhatsApp (Baileys) — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [NOTIFICATIONS-EMAIL.md](./NOTIFICATIONS-EMAIL.md) |
| Bloquea a | workers/whatsappWorker |

---

## Arquitectura

Patrón **planificador/elchalito**: Baileys self-hosted.

```
notificationQueue (in-memory o DB)
    ↓
whatsappWorker
    ↓
Baileys session per tenant (or shared dev session)
```

---

## Sesiones

| Modo dev | Una sesión global en `backend/.baileys/` |
| Modo prod objetivo | Sesión por tenant si plan incluye WhatsApp dedicado |

Tabla opcional `tenant_whatsapp_sessions` en admin con status connected/disconnected.

---

## Eventos

| Evento | Trigger | Plantilla |
|--------|---------|-----------|
| confirmacion | turno CONFIRMADO | `plantillas_notificacion` tipo confirmacion |
| cancelacion | CANCELADO | cancelacion |
| recordatorio_24h | cron | recordatorio_24h |
| recordatorio_2h | cron | recordatorio_2h |
| lista_espera | slot libre | custom |

Placeholders: `{{cliente_nombre}}`, `{{fecha}}`, `{{hora}}`, `{{local_nombre}}`, `{{link_gestion}}`

---

## Cola

```typescript
interface NotificationJob {
  tenantSlug: string;
  telefono: string;
  mensaje: string;
  turnoId?: number;
  tipo: string;
}
```

Worker procesa serial por tenant (rate limit BR-072).

---

## Registro

Insert `notificaciones_enviadas` post-envío exitoso.

---

## Fallback

Si WhatsApp falla 3 veces → encolar email si cliente tiene email.

---

## Dev setup

1. Arrancar worker: `npm run worker:notifications -w backend`
2. Escanear QR en terminal
3. Probar con reserva demo

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
