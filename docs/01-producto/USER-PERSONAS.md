# Personas de usuario — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [USER-JOURNEYS.md](./USER-JOURNEYS.md), [07-panel/ROLES-PERMISSIONS.md](../07-panel/ROLES-PERMISSIONS.md) |
| Bloquea a | UX, permisos, copy |

---

## P1 — Cliente final (María, 28)

**Contexto:** Reserva corte en barbería desde el celular, en el transporte o en casa.

| Atributo | Detalle |
|----------|---------|
| Edad | 25–45 |
| Dispositivo | Mobile 90% |
| Motivación | Rapidez, confirmación clara, no llamar |
| Frustraciones | Horarios confusos, doble reserva, no saber si quedó |
| Necesita | Ver servicios, elegir hora real, confirmación WhatsApp |

**Requisitos UX:**
- Máximo 5 pasos hasta confirmar
- Botones grandes, dark mode legible
- Resumen sticky con precio y hora
- Link para cancelar/reprogramar sin app

---

## P2 — Recepcionista (Lucía, 35)

**Contexto:** Atiende mostrador, teléfono y agenda del local.

| Atributo | Detalle |
|----------|---------|
| Rol panel | recepcionista |
| Motivación | Ver agenda del día, no perder reservas online |
| Frustraciones | Refrescar manualmente, turnos duplicados |
| Necesita | Agenda clara, alertas nuevas reservas, crear turno manual |

**Requisitos UX:**
- Dashboard "Hoy" al abrir
- SSE/notificación sonora al llegar reserva
- Crear turno en 3 clics
- Colores por estado de turno

---

## P3 — Dueño del local (Carlos, 42)

**Contexto:** Barbero dueño, configura servicios y revisa números.

| Atributo | Detalle |
|----------|---------|
| Rol panel | gerente |
| Motivación | Más turnos, menos no-shows, control total |
| Frustraciones | Configuración compleja, no entender stats |
| Necesita | Config servicios/horarios, MP, WhatsApp, stats semanales |

**Requisitos UX:**
- Wizard onboarding primer login
- Personalizar su página sin código
- Ver ingresos y no-shows en dashboard
- Gestionar usuarios del panel

---

## P4 — Profesional (Juan, 30)

**Contexto:** Barbero empleado, solo ve su agenda.

| Atributo | Detalle |
|----------|---------|
| Rol panel | profesional |
| Motivación | Saber quién viene y cuándo |
| Frustraciones | Ver turnos de otros, cambiar config |
| Necesita | Vista día/semana propia, marcar completado |

**Requisitos UX:**
- Agenda filtrada por profesional
- Sin acceso a config ni usuarios
- Mobile-friendly entre clientes

---

## P5 — Super admin / Dueño del software (Vos)

**Contexto:** Creás locales, das soporte, monitoreás plataforma.

| Atributo | Detalle |
|----------|---------|
| Rol | superadmin |
| Motivación | Escalar SaaS, onboarding rápido de locales |
| Necesita | CRUD tenants, ver provisioning, suspender morosos |

**Requisitos UX:**
- Crear local en <2 min (nombre, slug, email gerente)
- Ver estado BD y último error de provisioning
- Auditoría de acciones

---

## Matriz persona × módulo

| Módulo | P1 Cliente | P2 Recep. | P3 Dueño | P4 Prof. | P5 Super |
|--------|:----------:|:---------:|:--------:|:--------:|:--------:|
| App cliente | ✓ | — | preview | — | — |
| Panel agenda | — | ✓ | ✓ | ✓ | — |
| Config | — | lectura | ✓ | — | — |
| Stats | — | — | ✓ | — | — |
| Super panel | — | — | — | — | ✓ |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
