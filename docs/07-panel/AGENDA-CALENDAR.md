# Panel — Agenda y calendario

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [02-arquitectura/REALTIME.md](../02-arquitectura/REALTIME.md) |
| Bloquea a | panel/agenda |

---

## Vistas

| Vista | Descripción |
|-------|-------------|
| Día | Columnas por profesional, filas 15min |
| Semana | Grid 7 días, compact |
| Mes | Overview puntos turnos |

Toggle en header; sincronizar con URL (`nuqs`: `?vista=day&fecha=2026-05-20`)

---

## Interacciones

- Click slot vacío → modal nuevo turno
- Click turno → drawer detalle + acciones
- Drag turno → PATCH reprogramar (validar disponibilidad)
- Colores por estado:

| Estado | Color token |
|--------|-------------|
| PENDIENTE | amber |
| CONFIRMADO | green |
| COMPLETADO | blue |
| CANCELADO | gray strikethrough |
| NO_ASISTIO | red |

---

## Librería

Evaluar `@fullcalendar/react` o custom grid con CSS grid. Prefer custom para control design dark minimal.

---

## SSE

Al `turno.created` invalidar query agenda + toast.

---

## Filtro profesional

Dropdown; rol profesional locked a sí mismo.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
