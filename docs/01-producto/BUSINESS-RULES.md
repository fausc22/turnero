# Reglas de negocio — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [05-backend/AVAILABILITY-ENGINE.md](../05-backend/AVAILABILITY-ENGINE.md), [05-backend/TURNO-LIFECYCLE.md](../05-backend/TURNO-LIFECYCLE.md) |
| Bloquea a | Backend services, validaciones Zod |

---

## Reservas y disponibilidad

### BR-001 — Slot válido
Un slot es reservable si:
- Caí dentro de un `horario_operativo` del día (local o profesional)
- No solapa con turno existente (CONFIRMADO o PENDIENTE con TTL activo)
- No cae dentro de un `bloqueo_horario`
- Duración total = sum(`servicios.duracion_minutos`) + buffer configurable
- `fecha_inicio` >= now + anticipación mínima
- `fecha_inicio` <= now + anticipación máxima

### BR-002 — Granularidad de slots
Default: 15 minutos. Configurable por tenant (`slot_granularidad_minutos`: 5, 10, 15, 30).

### BR-003 — Buffer entre turnos
Default: 0 min. Configurable (`buffer_minutos` en políticas). Se suma al final de cada turno para calcular ocupación.

### BR-004 — Múltiples servicios
Un turno puede incluir N servicios. Duración = suma duraciones. Precio = suma precios al momento de reserva (snapshot en `turno_servicios.precio_unitario`).

### BR-005 — Profesional
- Si el cliente elige profesional específico, disponibilidad filtra por su agenda
- Si elige "cualquiera", slot válido si al menos un profesional activo está libre
- Un profesional no puede tener dos turnos solapados

### BR-006 — Anticipación mínima
Default: 2 horas. Impide reservar "para ya" si no hay tiempo de preparación.

### BR-007 — Anticipación máxima
Default: 30 días. Impide reservar demasiado adelante.

---

## Estados del turno

### BR-010 — Transiciones permitidas

| Desde | Hacia | Quién |
|-------|-------|-------|
| PENDIENTE | CONFIRMADO | Pago OK / gerente / auto si sin pago |
| PENDIENTE | CANCELADO | Cliente (token) / staff |
| CONFIRMADO | CANCELADO | Cliente (dentro política) / staff |
| CONFIRMADO | COMPLETADO | Staff post servicio |
| CONFIRMADO | NO_ASISTIO | Staff post grace period |
| CANCELADO | — | Terminal |
| NO_ASISTIO | — | Terminal |
| COMPLETADO | — | Terminal |

### BR-011 — TTL turno PENDIENTE sin pago
Si modo pago requerido: turno PENDIENTE expira a los 30 min sin pago confirmado → CANCELADO automático (job).

### BR-012 — Grace period no-show
Default: 15 min después de `fecha_fin` antes de permitir marcar NO_ASISTIO.

---

## Cancelación y reprogramación

### BR-020 — Política cancelación cliente
Configurable por tenant:
- `cancelacion_horas_minimas`: default 2
- Si cancela fuera de ventana → solo staff puede cancelar
- Cancelación libera slot inmediatamente

### BR-021 — Reprogramación
- Máximo 2 reprogramaciones por turno (configurable)
- Misma validación de disponibilidad que reserva nueva
- Notificación al local en cada cambio

### BR-022 — Token de gestión
- JWT o HMAC con `turno_id`, `tenant_slug`, exp 7 días
- Solo permite cancelar/reprogramar ese turno

---

## Pagos

### BR-030 — Modos de pago

| Modo | Comportamiento |
|------|----------------|
| SIN_PAGO | Turno CONFIRMADO al crear |
| SEÑA_PORCENTAJE | MP por % del total; CONFIRMADO al aprobar |
| SEÑA_FIJA | MP por monto fijo |
| PAGO_TOTAL | MP por 100% |
| PAGO_EN_LOCAL | CONFIRMADO al crear; cobro presencial |

### BR-031 — Idempotencia pago
Webhook MP procesado con idempotency key = `payment_id` MP. Duplicados ignorados.

### BR-032 — Reembolso
Manual fuera de scope v1 local; estado DEVUELTO registrable desde panel gerente.

---

## Productos y stock

### BR-040 — Stock
Al confirmar turno con productos: decrementar `stock_actual`. Si stock insuficiente → error `STOCK_INSUFICIENTE`.

### BR-041 — Productos inactivos
No mostrar en app cliente. No permitir agregar en reserva.

---

## Clientes

### BR-050 — Identificación
Teléfono WhatsApp es identificador principal. Email opcional pero recomendado.

### BR-051 — Unicidad
Unique `(telefono normalizado)` por tenant. Al reservar con teléfono existente → reutilizar cliente, actualizar nombre si difiere.

### BR-052 — Normalización teléfono
Formato E.164 preferido. Aceptar 10 dígitos AR y normalizar a +549...

---

## Local / tenant

### BR-060 — page_status

| Status | App cliente |
|--------|-------------|
| ACTIVA | Reservas habilitadas |
| PAUSADA | Landing visible, mensaje "no aceptamos reservas" |
| MANTENIMIENTO | Página minimal |
| BLOQUEADA | 403 (tenant suspendido por plataforma) |

### BR-061 — Tenant suspendido
`tenants.status = suspendido` → API responde 403 `TENANT_SUSPENDED`. Panel login bloqueado.

---

## Notificaciones

### BR-070 — Eventos WhatsApp obligatorios (plan basico+)
- Confirmación reserva
- Cancelación
- Recordatorio 24h (si plan lo incluye)
- Recordatorio 2h (profesional)

### BR-071 — Opt-out
Cliente puede indicar "solo email" si email provisto.

### BR-072 — Rate limit
Máx 10 mensajes/min por tenant para evitar spam accidental.

---

## Roles panel

### BR-080 — Permisos resumidos

| Acción | gerente | recepcionista | profesional |
|--------|:-------:|:-------------:|:-----------:|
| CRUD servicios | ✓ | — | — |
| Ver todos turnos | ✓ | ✓ | solo propios |
| Config MP/WhatsApp | ✓ | — | — |
| Usuarios | ✓ | — | — |
| Stats | ✓ | lectura | — |

Detalle en [07-panel/ROLES-PERMISSIONS.md](../07-panel/ROLES-PERMISSIONS.md).

---

## Lista de espera

### BR-090 — Entrada
Cliente deja teléfono + servicio + rango fechas preferido.

### BR-091 — Notificación
Al liberarse slot compatible: WhatsApp al primero en cola (FIFO). Link reserva TTL 15 min.

---

## Fidelización (membresías)

### BR-100 — Puntos
1 punto por cada $100 gastado (configurable). Acumulación al marcar COMPLETADO.

### BR-101 — Canje
Fuera de scope implementación v1 local; schema preparado.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
