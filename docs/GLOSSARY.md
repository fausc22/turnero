# Glosario — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [01-producto/VISION.md](./01-producto/VISION.md) |
| Bloquea a | Toda la documentación y el código |

---

## Términos de negocio

| Término | Definición |
|---------|------------|
| **TuTurno** | Nombre del producto SaaS de reserva de turnos |
| **Tenant** | Instancia aislada del sistema; un local/comercio cliente de la plataforma |
| **Local** | Sinónimo de tenant en contexto comercial (barbería, estética, consultorio) |
| **Slug** | Identificador único alfanumérico del tenant (`peluqueria-naz`, `estetica-luna`). En producción coincide con el subdominio |
| **Subdominio** | `{slug}.localhost` (dev) o `{slug}.{BASE_DOMAIN}` (prod). Forma principal de acceso del cliente final |
| **Cliente final** | Persona que reserva un turno online (no confundir con "cliente SaaS") |
| **Dueño / Gerente** | Usuario principal del local con acceso total al panel |
| **Profesional** | Persona que presta el servicio (barbero, estilista, kinesiólogo). Puede tener agenda propia |
| **Turno** | Reserva de un bloque de tiempo para uno o más servicios |
| **Slot** | Franja horaria disponible para reservar (ej. 16:00–16:45) |
| **Servicio** | Actividad ofrecida con duración y precio (corte, color, consulta) |
| **Producto** | Ítem adicional vendible en la reserva (gel, tratamiento retail) |
| **Seña** | Pago parcial anticipado para confirmar la reserva |
| **No-show** | Cliente que no asistió al turno confirmado |
| **Lista de espera** | Cola de clientes que quieren un horario no disponible |

---

## Términos técnicos

| Término | Definición |
|---------|------------|
| **Control plane** | Base de datos `tuturno_admin`: tenants, super usuarios, índice global, auditoría plataforma |
| **Data plane** | Base de datos por tenant `tuturno_{slug}`: turnos, clientes, servicios, etc. |
| **Provisioning** | Proceso automático de crear BD tenant, schema, usuario inicial y configuración |
| **BASE_DOMAIN** | Dominio configurable en prod (placeholder hasta registrar dominio real) |
| **x-tenant-slug** | Header HTTP obligatorio en rutas de negocio para identificar el tenant en la API |
| **JWT tenant** | Token de acceso del panel con `tenant_id`, `tenant_slug`, `rol` |
| **SUPER_JWT** | Token separado para el panel super admin (secret distinto) |
| **tenant_user_index** | Tabla en control plane que mapea email → tenant para login sin recordar slug |
| **Availability engine** | Algoritmo que calcula slots libres según horarios, bloqueos, turnos y duración |
| **page_status** | Estado de la página pública: ACTIVA, PAUSADA, MANTENIMIENTO, BLOQUEADA |
| **Token de reserva** | UUID firmado para cancelar/reprogramar sin login |
| **SSE** | Server-Sent Events para notificar al panel nuevas reservas en tiempo real |

---

## Subdominios reservados

| Subdominio | Uso |
|------------|-----|
| `panel` | Panel del local |
| `admin` | Super panel plataforma |
| `api` | Backend REST |
| `www` | Redirect al sitio marketing (futuro) |

No pueden usarse como slug de tenant.

---

## Estados del turno

| Estado | Descripción |
|--------|-------------|
| PENDIENTE | Creado, esperando confirmación o pago |
| CONFIRMADO | Confirmado (pago OK o modo sin pago) |
| CANCELADO | Cancelado por cliente o local |
| NO_ASISTIO | Marcado post-horario como ausente |
| COMPLETADO | Servicio realizado |

Ver [05-backend/TURNO-LIFECYCLE.md](./05-backend/TURNO-LIFECYCLE.md).

---

## Planes SaaS

| Plan | Descripción breve |
|------|-------------------|
| trial | Período de prueba limitado |
| basico | Funcionalidad core |
| profesional | MP, stats, múltiples profesionales |
| enterprise | Límites ampliados, soporte prioritario |

Ver [01-producto/PLANS-AND-LIMITS.md](./01-producto/PLANS-AND-LIMITS.md).

---

## Estado implementación

Ver [STATUS.md](./STATUS.md).
