# TuTurno — Documentación del proyecto

> Sistema SaaS multi-tenant de reserva de turnos para comercios locales.

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | Todo el monorepo |
| Bloquea a | Desarrollo Fase 0 en adelante |

---

## Cómo usar esta documentación

1. **Entender el producto:** empezar por [01-producto/VISION.md](./01-producto/VISION.md)
2. **Entender la arquitectura:** [02-arquitectura/OVERVIEW.md](./02-arquitectura/OVERVIEW.md)
3. **Implementar:** seguir [11-implementacion/ROADMAP.md](./11-implementacion/ROADMAP.md) y marcar tareas en [11-implementacion/BACKLOG.md](./11-implementacion/BACKLOG.md)
4. **Seguir progreso:** actualizar [STATUS.md](./STATUS.md) al completar cada módulo
5. **Levantar en local:** [12-dev-local/SETUP.md](./12-dev-local/SETUP.md)

---

## Índice completo

### Raíz

| Documento | Descripción |
|-----------|-------------|
| [GLOSSARY.md](./GLOSSARY.md) | Términos del dominio |
| [STATUS.md](./STATUS.md) | Tablero de implementación |

### 01 — Producto

| Documento | Descripción |
|-----------|-------------|
| [VISION.md](./01-producto/VISION.md) | Visión, propuesta de valor, segmentos |
| [USER-PERSONAS.md](./01-producto/USER-PERSONAS.md) | Personas y necesidades |
| [USER-JOURNEYS.md](./01-producto/USER-JOURNEYS.md) | Flujos end-to-end |
| [BUSINESS-RULES.md](./01-producto/BUSINESS-RULES.md) | Reglas de negocio |
| [PLANS-AND-LIMITS.md](./01-producto/PLANS-AND-LIMITS.md) | Planes SaaS y límites |

### 02 — Arquitectura

| Documento | Descripción |
|-----------|-------------|
| [OVERVIEW.md](./02-arquitectura/OVERVIEW.md) | Vista general del sistema |
| [SUBDOMAINS-AND-ROUTING.md](./02-arquitectura/SUBDOMAINS-AND-ROUTING.md) | Subdominios y resolución de tenant |
| [MULTITENANCY.md](./02-arquitectura/MULTITENANCY.md) | Control plane / data plane |
| [MONOREPO-STRUCTURE.md](./02-arquitectura/MONOREPO-STRUCTURE.md) | Estructura del monorepo |
| [AUTH.md](./02-arquitectura/AUTH.md) | Autenticación y roles |
| [REALTIME.md](./02-arquitectura/REALTIME.md) | SSE y eventos en tiempo real |
| [FILES-AND-MEDIA.md](./02-arquitectura/FILES-AND-MEDIA.md) | Archivos e imágenes por tenant |

### 03 — Stack

| Documento | Descripción |
|-----------|-------------|
| [TECH-STACK.md](./03-stack/TECH-STACK.md) | Tecnologías y versiones |
| [REUSE-PLANIFICADOR.md](./03-stack/REUSE-PLANIFICADOR.md) | Qué copiar de planificador |
| [REUSE-CARRITO.md](./03-stack/REUSE-CARRITO.md) | Qué copiar de carrito |
| [REUSE-TURNERO-LEGACY.md](./03-stack/REUSE-TURNERO-LEGACY.md) | Qué conservar del código actual |
| [DEPENDENCIES.md](./03-stack/DEPENDENCIES.md) | Dependencias npm por paquete |

### 04 — Datos

| Documento | Descripción |
|-----------|-------------|
| [SCHEMA-ADMIN.md](./04-datos/SCHEMA-ADMIN.md) | Control plane |
| [SCHEMA-TENANT.md](./04-datos/SCHEMA-TENANT.md) | Data plane por local |
| [ER-DIAGRAM.md](./04-datos/ER-DIAGRAM.md) | Diagrama entidad-relación |
| [MIGRATIONS-STRATEGY.md](./04-datos/MIGRATIONS-STRATEGY.md) | Estrategia de migraciones SQL |
| [SEED-DEV.md](./04-datos/SEED-DEV.md) | Datos de desarrollo |

### 05 — Backend

| Documento | Descripción |
|-----------|-------------|
| [ENDPOINTS.md](./05-backend/ENDPOINTS.md) | Catálogo de API |
| [ZOD-SCHEMAS.md](./05-backend/ZOD-SCHEMAS.md) | Schemas de validación |
| [ERROR-CODES.md](./05-backend/ERROR-CODES.md) | Códigos de error |
| [AVAILABILITY-ENGINE.md](./05-backend/AVAILABILITY-ENGINE.md) | Motor de disponibilidad |
| [TURNO-LIFECYCLE.md](./05-backend/TURNO-LIFECYCLE.md) | Ciclo de vida del turno |
| [PAYMENTS-MERCADOPAGO.md](./05-backend/PAYMENTS-MERCADOPAGO.md) | Pagos |
| [NOTIFICATIONS-WHATSAPP.md](./05-backend/NOTIFICATIONS-WHATSAPP.md) | WhatsApp Baileys |
| [NOTIFICATIONS-EMAIL.md](./05-backend/NOTIFICATIONS-EMAIL.md) | Email |
| [PROVISIONING.md](./05-backend/PROVISIONING.md) | Alta de tenants |
| [AUDIT-AND-LOGGING.md](./05-backend/AUDIT-AND-LOGGING.md) | Auditoría y logs |

### 06 — Frontend cliente

| Documento | Descripción |
|-----------|-------------|
| [OVERVIEW.md](./06-frontend-cliente/OVERVIEW.md) | App pública por subdominio |
| [SCREENS.md](./06-frontend-cliente/SCREENS.md) | Pantallas y flujos |
| [COMPONENTS.md](./06-frontend-cliente/COMPONENTS.md) | Componentes |
| [STATE-AND-API.md](./06-frontend-cliente/STATE-AND-API.md) | Estado y API client |
| [PAYMENT-FLOW.md](./06-frontend-cliente/PAYMENT-FLOW.md) | Flujo de pago |
| [ACCESSIBILITY-AND-MOBILE.md](./06-frontend-cliente/ACCESSIBILITY-AND-MOBILE.md) | Mobile y accesibilidad |

### 07 — Panel del local

| Documento | Descripción |
|-----------|-------------|
| [OVERVIEW.md](./07-panel/OVERVIEW.md) | Panel operativo |
| [NAVIGATION.md](./07-panel/NAVIGATION.md) | Navegación |
| [SCREENS.md](./07-panel/SCREENS.md) | Pantallas |
| [AGENDA-CALENDAR.md](./07-panel/AGENDA-CALENDAR.md) | Calendario |
| [CRM-LITE.md](./07-panel/CRM-LITE.md) | Clientes |
| [SETTINGS.md](./07-panel/SETTINGS.md) | Configuración |
| [STATISTICS.md](./07-panel/STATISTICS.md) | Estadísticas |
| [ROLES-PERMISSIONS.md](./07-panel/ROLES-PERMISSIONS.md) | Roles |

### 08 — Super panel

| Documento | Descripción |
|-----------|-------------|
| [OVERVIEW.md](./08-panel-super/OVERVIEW.md) | Panel plataforma |
| [SCREENS.md](./08-panel-super/SCREENS.md) | Pantallas |
| [OPERATIONS.md](./08-panel-super/OPERATIONS.md) | Operaciones diarias |

### 09 — UI/UX

| Documento | Descripción |
|-----------|-------------|
| [DESIGN-PRINCIPLES.md](./09-ui-ux/DESIGN-PRINCIPLES.md) | Principios de diseño |
| [DESIGN-SYSTEM.md](./09-ui-ux/DESIGN-SYSTEM.md) | Tokens y estilos |
| [COMPONENT-LIBRARY.md](./09-ui-ux/COMPONENT-LIBRARY.md) | Librería de componentes |
| [ANIMATIONS.md](./09-ui-ux/ANIMATIONS.md) | Animaciones |
| [TENANT-BRANDING.md](./09-ui-ux/TENANT-BRANDING.md) | Branding por local |
| [COPY-AND-TONE.md](./09-ui-ux/COPY-AND-TONE.md) | Copy y tono |

### 10 — Estado y gaps

| Documento | Descripción |
|-----------|-------------|
| [INVENTARIO-LEGACY.md](./10-estado/INVENTARIO-LEGACY.md) | Código actual |
| [GAPS.md](./10-estado/GAPS.md) | Brechas |
| [DECISION-LOG.md](./10-estado/DECISION-LOG.md) | Decisiones arquitectónicas |

### 11 — Implementación

| Documento | Descripción |
|-----------|-------------|
| [ROADMAP.md](./11-implementacion/ROADMAP.md) | Fases 0–10 |
| [BACKLOG.md](./11-implementacion/BACKLOG.md) | Tareas atómicas |
| [DEFINITION-OF-DONE.md](./11-implementacion/DEFINITION-OF-DONE.md) | Criterios de done |
| [PHASE-0-SCAFFOLD.md](./11-implementacion/PHASE-0-SCAFFOLD.md) | Fase 0 |
| [PHASE-1-DATA-PROVISIONING.md](./11-implementacion/PHASE-1-DATA-PROVISIONING.md) | Fase 1 |
| [PHASE-2-PUBLIC-API.md](./11-implementacion/PHASE-2-PUBLIC-API.md) | Fase 2 |
| [PHASE-3-FRONTEND-CLIENTE.md](./11-implementacion/PHASE-3-FRONTEND-CLIENTE.md) | Fase 3 |
| [PHASE-4-PANEL.md](./11-implementacion/PHASE-4-PANEL.md) | Fase 4 |
| [PHASE-5-PAGOS.md](./11-implementacion/PHASE-5-PAGOS.md) | Fase 5 |
| [PHASE-6-NOTIFICACIONES.md](./11-implementacion/PHASE-6-NOTIFICACIONES.md) | Fase 6 |
| [PHASE-7-PERSONALIZACION-STATS.md](./11-implementacion/PHASE-7-PERSONALIZACION-STATS.md) | Fase 7 |
| [PHASE-8-ROLES-AVANZADO.md](./11-implementacion/PHASE-8-ROLES-AVANZADO.md) | Fase 8 |
| [PHASE-9-TESTING.md](./11-implementacion/PHASE-9-TESTING.md) | Fase 9 |
| [PHASE-10-PULIDO.md](./11-implementacion/PHASE-10-PULIDO.md) | Fase 10 |

### 12 — Desarrollo local

| Documento | Descripción |
|-----------|-------------|
| [SETUP.md](./12-dev-local/SETUP.md) | Setup completo |
| [HOSTS-LOCAL.md](./12-dev-local/HOSTS-LOCAL.md) | /etc/hosts |
| [ENV-VARIABLES.md](./12-dev-local/ENV-VARIABLES.md) | Variables de entorno |
| [PM2-ECOSYSTEM.md](./12-dev-local/PM2-ECOSYSTEM.md) | PM2 |
| [TESTING-STRATEGY.md](./12-dev-local/TESTING-STRATEGY.md) | Estrategia de tests |
| [QA-CHECKLIST-LOCAL.md](./12-dev-local/QA-CHECKLIST-LOCAL.md) | Checklist QA |
| [TROUBLESHOOTING.md](./12-dev-local/TROUBLESHOOTING.md) | Problemas comunes |

### 13 — Producción (referencia)

| Documento | Descripción |
|-----------|-------------|
| [DEPLOYMENT-OVERVIEW.md](./13-produccion/DEPLOYMENT-OVERVIEW.md) | Deploy futuro |
| [BACKUP-RESTORE.md](./13-produccion/BACKUP-RESTORE.md) | Backup por tenant |

---

## Convenciones de documentación

Cada archivo incluye en su cabecera:

- **Estado doc:** HECHO | BORRADOR | OBSOLETO
- **Última revisión:** fecha ISO
- **Relacionado con:** links a docs relacionados
- **Bloquea a:** qué implementación depende de este doc

Al final de docs funcionales hay una sección **Estado implementación** con link a [STATUS.md](./STATUS.md).

---

## Por dónde empezar a desarrollar

Después de leer esta documentación, el desarrollo comienza en:

**[11-implementacion/PHASE-0-SCAFFOLD.md](./11-implementacion/PHASE-0-SCAFFOLD.md)** — schemas SQL, middleware tenant, estructura monorepo, hosts locales.
