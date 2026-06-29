# Panel — Pantallas

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [AGENDA-CALENDAR.md](./AGENDA-CALENDAR.md) |
| Bloquea a | panel routes |

---

## Dashboard `/dashboard`

- Cards: turnos hoy, confirmados, pendientes pago, no-shows mes
- Próximo turno (countdown)
- Ingresos semana (si MP)
- Lista últimos 5 turnos
- Quick actions: nuevo turno, bloquear horario

---

## Agenda `/agenda`

Ver AGENDA-CALENDAR.md

---

## Turnos `/turnos`

- Tabla filtros: fecha, estado, profesional, búsqueda cliente
- Acciones fila: ver, editar, cambiar estado, reenviar WhatsApp
- Modal detalle turno

---

## Clientes `/clientes`

- Tabla búsqueda teléfono/nombre
- Modal crear/editar
- Link ficha cliente `/clientes/[id]`

---

## Servicios / Productos

- Tabla CRUD completo create/edit/delete toggle activo
- Drag orden (opcional fase 7)
- Form: nombre, duración, precio, categoría

---

## Profesionales

- CRUD + foto upload
- Asignar servicios checkbox list

---

## Horarios

- Tabla semanal lun-dom
- Múltiples franjas por día
- Sección bloqueos: calendario + lista

---

## Personalización

- Preview iframe/live mock página cliente
- Upload logo, hero, favicon
- Color picker primario/acento
- Texto bienvenida

---

## Estadísticas

Ver STATISTICS.md

---

## Configuración

Ver SETTINGS.md

---

## Usuarios

- CRUD usuarios panel
- Asignar rol
- Link profesional opcional

---

## Login `/login`

- Email, password, remember me
- Error claro INVALID_CREDENTIALS

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
