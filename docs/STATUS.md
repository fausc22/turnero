# Tablero de estado — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [BACKLOG.md](./11-implementacion/BACKLOG.md) |
| Bloquea a | Seguimiento de implementación |

> Actualizar este archivo al completar cada módulo o fase.

---

## Leyenda

| Estado | Significado |
|--------|-------------|
| HECHO | Implementado y verificado en local |
| EN_CURSO | En desarrollo activo |
| PENDIENTE | Documentado, sin implementar |
| LEGACY | Código viejo; reemplazar o adaptar |
| N/A | No aplica en alcance actual |

---

## Documentación

| Módulo | Estado |
|--------|--------|
| docs/ (completo) | HECHO |

---

## Infraestructura y monorepo

| Módulo | Estado |
|--------|--------|
| Git init | HECHO |
| Estructura panel/ | HECHO |
| Estructura panel-super/ | HECHO |
| ecosystem.config.cjs | HECHO |
| data/schema_admin.sql | HECHO |
| data/schema_tenant.sql | HECHO |
| data/seed_dev.sql | HECHO |
| Scripts setup DB | HECHO |

---

## Backend

| Módulo | Estado |
|--------|--------|
| Middleware tenant (subdominio + header) | HECHO |
| AppError + errorHandler | HECHO |
| Auth JWT tenant (login global) | HECHO |
| Auth SUPER_JWT | HECHO |
| API pública (/api/public/*) | HECHO |
| API tenant (/api/tenant/*) | HECHO |
| API super (/api/super/*) | HECHO |
| Provisioning service | HECHO |
| Availability engine | HECHO |
| Turno lifecycle completo | HECHO |
| Mercado Pago tenant | HECHO |
| Mercado Pago legacy (/api/legacy) | LEGACY |
| WhatsApp Baileys worker | HECHO |
| Email notifications | HECHO |
| Notification queue (admin DB) | HECHO |
| Recordatorios cron 24h/2h | HECHO |
| Lista de espera | HECHO |
| SSE reservas | HECHO |
| Upload media | HECHO |
| Estadísticas API | HECHO |
| Geocoding OpenCage | HECHO |
| Membresías puntos | HECHO |
| Tests Jest + Supertest HTTP | HECHO |
| Tests Playwright E2E | HECHO |

---

## Frontend cliente

| Módulo | Estado |
|--------|--------|
| Middleware subdominio Next.js | HECHO |
| Landing tenant | HECHO |
| Flujo reserva completo | HECHO |
| Páginas pago resultado | HECHO |
| Cancelar/reprogramar token | HECHO |
| Design system dark | HECHO |
| Tests E2E reserva | HECHO |

---

## Panel del local

| Módulo | Estado |
|--------|--------|
| Login global + tenant | HECHO |
| Sidebar navegación | HECHO |
| Dashboard | HECHO |
| Agenda calendario | HECHO |
| CRUD turnos (editar) | HECHO |
| CRUD clientes (editar) | HECHO |
| CRUD servicios/productos (editar) | HECHO |
| Profesionales | HECHO |
| Horarios y bloqueos UI | HECHO |
| Personalización | HECHO |
| Estadísticas | HECHO |
| Onboarding wizard | HECHO |
| CRM lite (tags/notas) | HECHO |
| Configuración MP (pagos) | HECHO |
| Configuración WhatsApp / plantillas | HECHO |
| Lista de espera (frontend) | HECHO |
| Listado pagos panel | HECHO |
| Usuarios y roles | HECHO |
| Lista espera panel | HECHO |
| Categorías servicio | HECHO |
| Límites de plan | HECHO |
| Trial expiry job | HECHO |
| SSE notificaciones | HECHO |

---

## Super panel

| Módulo | Estado |
|--------|--------|
| Login super admin | HECHO |
| CRUD tenants | HECHO |
| Provisioning UI | HECHO |
| Suspender/activar tenant | HECHO |
| Auditoría plataforma | HECHO |

---

## Fases de implementación

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Scaffold | HECHO |
| 1 | Control plane + provisioning | HECHO |
| 2 | API pública | HECHO |
| 3 | Frontend cliente | HECHO |
| 4 | Panel operativo | HECHO |
| 5 | Pagos MP | HECHO |
| 6 | Notificaciones | HECHO |
| 7 | Personalización + stats | HECHO |
| 8 | Roles + features avanzados | HECHO |
| 9 | Testing | HECHO |
| 10 | Pulido + QA local / cierre productivo | EN_CURSO |
| 10+ | Staging + piloto controlado | PENDIENTE (runbooks listos) |

---

## QA local

| Checklist | Estado |
|-----------|--------|
| QA-CHECKLIST-LOCAL.md completo | PENDIENTE |
