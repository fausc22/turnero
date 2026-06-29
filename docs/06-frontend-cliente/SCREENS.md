# Frontend cliente — Pantallas

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [PAYMENT-FLOW.md](./PAYMENT-FLOW.md) |
| Bloquea a | frontend/app/* |

---

## S1 — Landing `/`

**Contenido:**
- Hero con imagen tenant (hero_path)
- Logo + nombre local
- Dirección + mapa link (lat/lng)
- Horario hoy ("Abierto hasta 19:00")
- CTA "Reservar turno"
- Lista servicios destacados (top 4)
- Footer: teléfono, redes (config_json)

**Estados:** loading skeleton, PAUSADA, error tenant not found

---

## S2 — Reservar `/reservar`

Wizard stepper (5 pasos):

### Paso 1 — Servicios
- Grid cards servicio: nombre, duración, precio
- Multi-select con checkbox
- Sticky footer: total duración + precio

### Paso 2 — Profesional
- Radio: "Cualquier disponible" (default)
- Cards profesionales con foto

### Paso 3 — Fecha y hora
- Date picker semana horizontal scroll
- Grid slots disponibles (API disponibilidad)
- Empty state: "No hay horarios, probar otra fecha"

### Paso 4 — Tus datos
- Nombre, teléfono (required), email optional
- Notas textarea
- Checkbox política cancelación link

### Paso 5 — Confirmación / Pago
- Resumen completo
- Si requiere pago: botón "Pagar seña $X" → MP
- Si no: botón "Confirmar reserva"

---

## S3 — Confirmación `/confirmacion/[id]`

- Icono check animado
- Detalle turno
- Botón agregar calendario (.ics download)
- Link gestionar turno
- WhatsApp "Te enviamos confirmación"

---

## S4 — Pago resultado `/pago/*`

- exito: redirect confirmación
- error: mensaje + reintentar
- pendiente: "Estamos procesando"

---

## S5 — Gestionar `/gestionar/[token]`

- Ver turno
- Botones cancelar / reprogramar
- Reprogramar → mini wizard paso 3+4

---

## Componentes por pantalla

Ver [COMPONENTS.md](./COMPONENTS.md).

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
