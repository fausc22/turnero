# Backlog — TuTurno
| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [ROADMAP.md](./ROADMAP.md) |
| Bloquea a | Implementación |

> Marcar `[x]` al completar. Actualizar [STATUS.md](../STATUS.md).

---

## Fase 0 — Scaffold

- [x] **T-001** | Infra | Inicializar git en monorepo
  - Criterio: Repo git init + .gitignore
  - Depende: -

- [x] **T-002** | Infra | Crear .gitignore completo
  - Criterio: node_modules, .env, uploads, logs, .next
  - Depende: T-001

- [x] **T-003** | Data | Escribir data/schema_admin.sql
  - Criterio: Todas tablas admin doc
  - Depende: -

- [x] **T-004** | Data | Escribir data/schema_tenant.sql
  - Criterio: Todas tablas tenant doc
  - Depende: -

- [x] **T-005** | Data | Script setup-admin-db.ts
  - Criterio: Crea tuturno_admin
  - Depende: T-003

- [x] **T-006** | Backend | Refactor database.ts multi-tenant pool
  - Criterio: USE por contexto
  - Depende: T-005

- [x] **T-007** | Backend | Implementar tenant middleware TS
  - Criterio: x-tenant-slug + lookup admin
  - Depende: T-006

- [x] **T-008** | Backend | Implementar AsyncLocalStorage tenant context
  - Criterio: runWithTenantContext
  - Depende: T-007

- [x] **T-009** | Backend | AppError + errorHandler codes
  - Criterio: ERROR-CODES.md
  - Depende: T-008

- [x] **T-010** | Backend | Reestructurar app.ts routes mount
  - Criterio: public/tenant/super prefixes
  - Depende: T-009

- [x] **T-011** | Infra | Crear ecosystem.config.cjs
  - Criterio: Puertos 4010-4013
  - Depende: -

- [x] **T-012** | Infra | Documentar HOSTS en máquina dev
  - Criterio: 12-dev-local/HOSTS-LOCAL
  - Depende: -

- [x] **T-013** | Panel | Scaffold panel/ Next.js 16
  - Criterio: App arranca :4011
  - Depende: T-011

- [x] **T-014** | Super | Scaffold panel-super/ Next.js 16
  - Criterio: App arranca :4012
  - Depende: T-011

- [x] **T-015** | Frontend | Actualizar frontend/ puerto 4010
  - Criterio: package.json dev port
  - Depende: T-011

- [x] **T-016** | Frontend | Eliminar rutas [slug] legacy
  - Criterio: Solo subdominio
  - Depende: T-015

- [x] **T-017** | Frontend | middleware.ts extract tenant host
  - Criterio: SUBDOMAINS doc
  - Depende: T-016

- [x] **T-018** | Backend | CORS config multi-origin
  - Criterio: localhost subdomains
  - Depende: T-010

- [x] **T-019** | Backend | env.example backend
  - Criterio: ENV-VARIABLES.md
  - Depende: T-010

- [x] **T-020** | Infra | README root actualizado
  - Criterio: Link docs
  - Depende: T-001


## Fase 1 — Control plane

- [x] **T-021** | Backend | tenantProvisioningService
  - Criterio: PROVISIONING.md
  - Depende: T-004,T-008

- [x] **T-022** | Backend | POST /api/super/tenants
  - Criterio: Crea tenant + provision
  - Depende: T-021

- [x] **T-023** | Backend | GET/PUT/DELETE /api/super/tenants
  - Criterio: CRUD completo
  - Depende: T-022

- [x] **T-024** | Backend | SUPER JWT auth middleware
  - Criterio: AUTH.md separado
  - Depende: T-009

- [x] **T-025** | Backend | POST /api/super/auth/login
  - Criterio: Super login
  - Depende: T-024

- [x] **T-026** | Backend | platform_audit_log writes
  - Criterio: AUDIT doc
  - Depende: T-022

- [x] **T-027** | Data | seed_dev.sql super admin
  - Criterio: SEED-DEV.md
  - Depende: T-005

- [x] **T-028** | Data | seed script 2 tenants demo
  - Criterio: peluqueria-naz, estetica-luna
  - Depende: T-021,T-027

- [x] **T-029** | Super | Login page panel-super
  - Criterio: Funcional
  - Depende: T-025

- [x] **T-030** | Super | Tenants list page
  - Criterio: Tabla tenants
  - Depende: T-023,T-029

- [x] **T-031** | Super | Tenant create form
  - Criterio: Provisioning UI
  - Depende: T-022,T-030

- [x] **T-032** | Super | Tenant detail + runs
  - Criterio: Provisioning status
  - Depende: T-023,T-031

- [x] **T-033** | Backend | tenant_user_index sync
  - Criterio: Login global
  - Depende: T-021

- [x] **T-034** | Backend | POST /api/auth/login global
  - Criterio: Panel login
  - Depende: T-033,T-024

- [x] **T-035** | Backend | JWT tenant emit + refresh
  - Criterio: tenant_slug in token
  - Depende: T-034

- [x] **T-036** | Backend | requireTenantMatch middleware
  - Criterio: Mismatch 403
  - Depende: T-035

- [x] **T-037** | Panel | Login page panel
  - Criterio: Email password
  - Depende: T-034,T-013

- [x] **T-038** | Panel | AuthContext + api interceptor
  - Criterio: x-tenant-slug
  - Depende: T-037


## Fase 2 — API pública

- [x] **T-039** | Backend | GET /api/public/config
  - Criterio: Branding + status
  - Depende: T-008

- [x] **T-040** | Backend | GET /api/public/servicios
  - Criterio: Activos + categorías
  - Depende: T-039

- [x] **T-041** | Backend | GET /api/public/profesionales
  - Criterio: Con servicios
  - Depende: T-040

- [x] **T-042** | Backend | disponibilidadService
  - Criterio: AVAILABILITY-ENGINE.md
  - Depende: T-040

- [x] **T-043** | Backend | GET /api/public/disponibilidad
  - Criterio: Slots reales
  - Depende: T-042

- [x] **T-044** | Backend | horarios_operativos repository
  - Criterio: CRUD queries
  - Depende: T-004

- [x] **T-045** | Backend | bloqueos repository expose
  - Criterio: Usado en availability
  - Depende: T-044

- [x] **T-046** | Backend | POST /api/public/reservas
  - Criterio: Sin JWT + transaction
  - Depende: T-043

- [x] **T-047** | Backend | Cliente upsert por teléfono
  - Criterio: BR-051
  - Depende: T-046

- [x] **T-048** | Backend | turnoService adapt tenant context
  - Criterio: Sin barberia_id
  - Depende: T-046

- [x] **T-049** | Backend | token_gestion generación
  - Criterio: UUID+HMAC
  - Depende: T-046

- [x] **T-050** | Backend | Rate limit public routes
  - Criterio: express-rate-limit
  - Depende: T-046

- [x] **T-051** | Backend | Idempotency reservas
  - Criterio: idempotencyKey
  - Depende: T-046

- [x] **T-052** | Backend | GET /api/public/reservas/:token
  - Criterio: Gestionar
  - Depende: T-049

- [x] **T-053** | Backend | POST cancelar/reprogramar token
  - Criterio: BUSINESS-RULES
  - Depende: T-052

- [x] **T-054** | Backend | GET /api/public/productos
  - Criterio: Stock > 0
  - Depende: T-040

- [x] **T-055** | Backend | Plan limits middleware
  - Criterio: PLANS-AND-LIMITS
  - Depende: T-046

- [x] **T-056** | Backend | Zod schemas public
  - Criterio: ZOD-SCHEMAS.md
  - Depende: T-046

- [x] **T-057** | Backend | Tests integración disponibilidad
  - Criterio: Casos borde
  - Depende: T-043

- [x] **T-058** | Backend | Tests integración reserva
  - Criterio: Overlap SLOT_TAKEN
  - Depende: T-046

- [x] **T-059** | Backend | Job expirePendingTurnos
  - Criterio: TURNO-LIFECYCLE
  - Depende: T-048

- [x] **T-060** | Backend | GET /api/public/asset/:type
  - Criterio: FILES-AND-MEDIA
  - Depende: T-039


## Fase 3 — Frontend cliente

- [x] **T-061** | UI | Design tokens globals.css frontend
  - Criterio: DESIGN-SYSTEM.md
  - Depende: T-017

- [x] **T-062** | UI | Instalar shadcn base frontend
  - Criterio: Button Card Input...
  - Depende: T-061

- [x] **T-063** | Frontend | TenantContext + fetch config
  - Criterio: STATE-AND-API
  - Depende: T-039,T-017

- [x] **T-064** | Frontend | lib/api.ts interceptor slug
  - Criterio: Header tenant
  - Depende: T-063

- [x] **T-065** | Frontend | Landing page S1
  - Criterio: SCREENS.md
  - Depende: T-063

- [x] **T-066** | Frontend | page_status PAUSADA UI
  - Criterio: VISION
  - Depende: T-065

- [x] **T-067** | Frontend | BookingStepper component
  - Criterio: 5 steps
  - Depende: T-062

- [x] **T-068** | Frontend | Paso 1 ServiceCard grid
  - Criterio: Multi select
  - Depende: T-067,T-040

- [x] **T-069** | Frontend | Paso 2 ProfessionalPicker
  - Criterio: Cualquiera + list
  - Depende: T-068,T-041

- [x] **T-070** | Frontend | Paso 3 WeekDateStrip + TimeSlotGrid
  - Criterio: API disponibilidad
  - Depende: T-069,T-043

- [x] **T-071** | Frontend | Paso 4 ClienteForm RHF Zod
  - Criterio: Validación
  - Depende: T-070

- [x] **T-072** | Frontend | Paso 5 resumen + confirmar
  - Criterio: POST reservas
  - Depende: T-071,T-046

- [x] **T-073** | Frontend | StickyBookingSummary footer
  - Criterio: Mobile
  - Depende: T-068

- [x] **T-074** | Frontend | Confirmacion page + .ics
  - Criterio: SCREENS S3
  - Depende: T-072

- [x] **T-075** | Frontend | Framer page transitions
  - Criterio: ANIMATIONS.md
  - Depende: T-065

- [x] **T-076** | Frontend | Skeleton loaders
  - Criterio: Loading states
  - Depende: T-065

- [x] **T-077** | Frontend | Error SLOT_TAKEN UX
  - Criterio: Refresh slots
  - Depende: T-070

- [x] **T-078** | Frontend | Tenant accent CSS var
  - Criterio: TENANT-BRANDING
  - Depende: T-063

- [x] **T-079** | Frontend | Gestionar turno /gestionar/[token]
  - Criterio: Cancel reprog
  - Depende: T-053

- [x] **T-080** | Frontend | Lista espera form
  - Criterio: POST lista-espera
  - Depende: T-054

- [x] **T-081** | Frontend | Reduced motion support
  - Criterio: A11Y
  - Depende: T-075

- [x] **T-082** | Frontend | Empty states
  - Criterio: No slots
  - Depende: T-070

- [x] **T-083** | UI | Copy español rioplatense
  - Criterio: COPY-AND-TONE
  - Depende: T-065

- [x] **T-084** | Frontend | TanStack Query setup
  - Criterio: QueryClient provider
  - Depende: T-063

- [x] **T-085** | Frontend | Remove legacy BarberiaContext
  - Criterio: Cleanup
  - Depende: T-063


## Fase 4 — Panel

- [x] **T-086** | UI | Design tokens panel dark
  - Criterio: Same system
  - Depende: T-013

- [x] **T-087** | UI | Sidebar + layout panel
  - Criterio: NAVIGATION.md
  - Depende: T-086,T-038

- [x] **T-088** | Panel | Dashboard page
  - Criterio: SCREENS
  - Depende: T-087

- [x] **T-089** | Backend | GET /api/tenant/turnos filters
  - Criterio: List
  - Depende: T-048,T-036

- [x] **T-090** | Backend | GET /api/tenant/agenda
  - Criterio: Range query
  - Depende: T-089

- [x] **T-091** | Panel | Agenda día vista
  - Criterio: AGENDA-CALENDAR
  - Depende: T-090,T-087

- [x] **T-092** | Panel | Agenda semana vista
  - Criterio: nuqs fecha
  - Depende: T-091

- [x] **T-093** | Panel | Turno drawer detalle
  - Criterio: Acciones estado
  - Depende: T-091

- [x] **T-094** | Backend | PATCH turno estado
  - Criterio: Lifecycle
  - Depende: T-048

- [x] **T-095** | Panel | Turnos tabla + filtros
  - Criterio: SCREENS
  - Depende: T-089,T-087

- [x] **T-096** | Backend | CRUD clientes completo
  - Criterio: Edit
  - Depende: T-036

- [x] **T-097** | Panel | Clientes CRUD UI
  - Criterio: CRM lite list
  - Depende: T-096,T-087

- [x] **T-098** | Panel | Cliente ficha /clientes/[id]
  - Criterio: Historial
  - Depende: T-097

- [x] **T-099** | Backend | CRUD servicios edit
  - Criterio: PUT
  - Depende: T-036

- [x] **T-100** | Panel | Servicios CRUD edit UI
  - Criterio: Forms
  - Depende: T-099,T-087

- [x] **T-101** | Backend | CRUD productos edit
  - Criterio: Stock
  - Depende: T-036

- [x] **T-102** | Panel | Productos CRUD UI
  - Criterio: Forms
  - Depende: T-101,T-087

- [x] **T-103** | Backend | CRUD profesionales
  - Criterio: Schema
  - Depende: T-036

- [x] **T-104** | Panel | Profesionales CRUD + foto
  - Criterio: Upload
  - Depende: T-103,T-087

- [x] **T-105** | Backend | CRUD horarios_operativos
  - Criterio: API
  - Depende: T-044

- [x] **T-106** | Panel | Horarios semanal UI
  - Criterio: SETTINGS
  - Depende: T-105,T-087

- [x] **T-107** | Backend | CRUD bloqueos
  - Criterio: API
  - Depende: T-045

- [x] **T-108** | Panel | Bloqueos UI
  - Criterio: Calendario
  - Depende: T-107,T-087

- [x] **T-109** | Panel | Modal crear turno manual
  - Criterio: J4 journey
  - Depende: T-091,T-046

- [x] **T-110** | Backend | SSE /api/tenant/events/stream
  - Criterio: REALTIME.md
  - Depende: T-048

- [x] **T-111** | Panel | SSE client + toast sound
  - Criterio: fetch-event-source
  - Depende: T-110,T-087

- [x] **T-112** | Panel | Drag drop reprogramar agenda
  - Criterio: Optional validate
  - Depende: T-091

- [x] **T-113** | Panel | Mobile bottom nav
  - Criterio: NAVIGATION
  - Depende: T-087

- [x] **T-114** | Panel | Role based nav hide
  - Criterio: ROLES
  - Depende: T-087

- [x] **T-115** | Panel | Quick actions dashboard
  - Criterio: Nuevo turno
  - Depende: T-088


## Fase 5 — Pagos

- [x] **T-116** | Backend | POST /api/public/pagos/preference
  - Criterio: MP
  - Depende: T-046

- [x] **T-117** | Backend | Adapt mercadoPagoService tenant
  - Criterio: Token local
  - Depende: T-116

- [x] **T-118** | Backend | Webhook MP /api/webhooks/mercadopago
  - Criterio: Idempotent
  - Depende: T-117

- [x] **T-119** | Backend | External reference parser
  - Criterio: tenant+turno
  - Depende: T-118

- [x] **T-120** | Frontend | Pago redirect init_point
  - Criterio: PAYMENT-FLOW
  - Depende: T-116,T-072

- [x] **T-121** | Frontend | Pages pago/exito error pendiente
  - Criterio: SCREENS S4
  - Depende: T-120

- [x] **T-122** | Frontend | Poll confirmación post MP
  - Criterio: CONFIRMADO
  - Depende: T-121

- [x] **T-123** | Panel | Config MP token UI
  - Criterio: SETTINGS pagos
  - Depende: T-087

- [x] **T-124** | Backend | PUT politicas_reserva modo_pago
  - Criterio: API
  - Depende: T-036

- [x] **T-125** | Backend | Tests webhook MP mock
  - Criterio: Approved rejected
  - Depende: T-118

- [x] **T-126** | Panel | Listado pagos
  - Criterio: GET pagos
  - Depende: T-118,T-087

- [x] **T-127** | Backend | Pago en local flow
  - Criterio: CONFIRMADO directo
  - Depende: T-124


## Fase 6 — Notificaciones

- [x] **T-128** | Backend | emailService nodemailer
  - Criterio: NOTIFICATIONS-EMAIL
  - Depende: T-019

- [x] **T-129** | Backend | HTML templates email
  - Criterio: Minimal dark
  - Depende: T-128

- [x] **T-130** | Backend | notificationQueue
  - Criterio: Jobs
  - Depende: T-128

- [x] **T-131** | Backend | whatsappWorker Baileys
  - Criterio: NOTIFICATIONS-WHATSAPP
  - Depende: T-130

- [x] **T-132** | Backend | Plantillas WhatsApp DB
  - Criterio: placeholders
  - Depende: T-131

- [x] **T-133** | Backend | Enqueue on turno CONFIRMADO
  - Criterio: Lifecycle hook
  - Depende: T-048,T-131

- [x] **T-134** | Backend | notificaciones_enviadas tracking
  - Criterio: Anti dup
  - Depende: T-133

- [x] **T-135** | Backend | reminderCron 24h 2h
  - Criterio: Jobs
  - Depende: T-134

- [x] **T-136** | Backend | Cancel notification
  - Criterio: WhatsApp+email
  - Depende: T-133

- [x] **T-137** | Panel | Reenviar confirmación button
  - Criterio: POST
  - Depende: T-133,T-093

- [x] **T-138** | Panel | WhatsApp status config UI
  - Criterio: QR reconnect dev
  - Depende: T-131,T-123

- [x] **T-139** | Panel | Edit plantillas modal
  - Criterio: Gerente
  - Depende: T-132,T-123

- [x] **T-140** | Backend | Lista espera notify job
  - Criterio: BR-091
  - Depende: T-080,T-131

- [x] **T-141** | Backend | npm run worker:notifications
  - Criterio: Script
  - Depende: T-131

- [x] **T-142** | Backend | Fallback email if WA fail
  - Criterio: 3 retries
  - Depende: T-131,T-128


## Fase 7 — Personalización + stats

- [x] **T-143** | Backend | PUT tenant_estilos
  - Criterio: Branding
  - Depende: T-036

- [x] **T-144** | Backend | POST media upload sharp
  - Criterio: FILES
  - Depende: T-143

- [x] **T-145** | Panel | Personalización page preview
  - Criterio: TENANT-BRANDING
  - Depende: T-143,T-087

- [x] **T-146** | Panel | Color picker + textos
  - Criterio: Forms
  - Depende: T-145

- [x] **T-147** | Backend | GET estadisticas/resumen
  - Criterio: STATISTICS
  - Depende: T-089

- [x] **T-148** | Backend | GET estadisticas/servicios-top
  - Criterio: Charts data
  - Depende: T-147

- [x] **T-149** | Panel | Estadísticas page Recharts
  - Criterio: Dark charts
  - Depende: T-147,T-087

- [x] **T-150** | Panel | Period selector stats
  - Criterio: nuqs
  - Depende: T-149

- [x] **T-151** | Backend | CRM tags notas clientes
  - Criterio: Schema
  - Depende: T-096

- [x] **T-152** | Panel | Cliente tags notas UI
  - Criterio: CRM-LITE
  - Depende: T-098

- [x] **T-153** | Backend | membresias puntos on COMPLETADO
  - Criterio: BR-100
  - Depende: T-094

- [x] **T-154** | Panel | Onboarding wizard first login
  - Criterio: 5 steps
  - Depende: T-088

- [x] **T-155** | Backend | OpenCage geocode optional
  - Criterio: REUSE-CARRITO
  - Depende: T-036

- [x] **T-156** | Panel | Geocode dirección button
  - Criterio: Config
  - Depende: T-155,T-123

- [x] **T-157** | Frontend | Map link dirección landing
  - Criterio: lat/lng
  - Depende: T-065,T-155


## Fase 8 — Roles + avanzado

- [x] **T-158** | Backend | requireRole middleware
  - Criterio: ROLES-PERMISSIONS
  - Depende: T-036

- [x] **T-159** | Backend | Profesional solo own turnos
  - Criterio: Filter API
  - Depende: T-158,T-089

- [x] **T-160** | Panel | useCan permission hook
  - Criterio: Hide UI
  - Depende: T-158,T-114

- [x] **T-161** | Backend | CRUD usuarios panel
  - Criterio: Gerente only
  - Depende: T-158

- [x] **T-162** | Panel | Usuarios page
  - Criterio: Roles assign
  - Depende: T-161,T-087

- [x] **T-163** | Backend | Audit middleware mount
  - Criterio: Mutations
  - Depende: T-026

- [x] **T-164** | Backend | platform plan limit enforce
  - Criterio: Features
  - Depende: T-055

- [x] **T-165** | Super | Suspend tenant UI
  - Criterio: status
  - Depende: T-032

- [x] **T-166** | Super | Audit log page
  - Criterio: SCREENS
  - Depende: T-026,T-030

- [x] **T-167** | Backend | Trial expiry job
  - Criterio: PLANS
  - Depende: T-055

- [x] **T-168** | Backend | POST lista-espera completo
  - Criterio: Already partial T-080
  - Depende: T-140

- [x] **T-169** | Panel | Lista espera management
  - Criterio: View queue
  - Depende: T-168,T-087

- [x] **T-170** | Backend | Categorias servicio CRUD
  - Criterio: Schema
  - Depende: T-099

- [x] **T-171** | Panel | Categorias UI servicios
  - Criterio: Grouped
  - Depende: T-170,T-100

- [x] **T-172** | Backend | profesional_servicios M2M
  - Criterio: Assignment
  - Depende: T-103


## Fase 9 — Testing

- [x] **T-173** | Backend | Jest config + setup
  - Criterio: TESTING-STRATEGY
  - Depende: T-058

- [x] **T-174** | Backend | Tests auth login global
  - Criterio: Integration
  - Depende: T-034,T-173

- [x] **T-175** | Backend | Tests tenant mismatch 403
  - Criterio: Security
  - Depende: T-036,T-173

- [x] **T-176** | Backend | Tests super vs tenant JWT
  - Criterio: Security
  - Depende: T-024,T-173

- [x] **T-177** | Backend | Tests provisioning mock DB
  - Criterio: Service
  - Depende: T-021,T-173

- [x] **T-178** | Backend | Tests cancelacion token
  - Criterio: Public
  - Depende: T-053,T-173

- [x] **T-179** | E2E | Playwright config
  - Criterio: Subdomains hosts
  - Depende: T-085,T-115

- [x] **T-180** | E2E | Playwright flujo reserva completo
  - Criterio: Critical path
  - Depende: T-179,T-127

- [x] **T-181** | E2E | Playwright panel crear turno
  - Criterio: Manual booking
  - Depende: T-179,T-109

- [x] **T-182** | E2E | Playwright super crear tenant
  - Criterio: Provisioning
  - Depende: T-179,T-031


## Fase 10 — Pulido

- [ ] **T-183** | Infra | packages/ui shared optional
  - Criterio: DRY components
  - Depende: T-062,T-086

- [ ] **T-184** | Docs | Actualizar STATUS.md final
  - Criterio: All HECHO
  - Depende: T-180

- [ ] **T-185** | QA | Ejecutar QA-CHECKLIST-LOCAL completo
  - Criterio: 100%
  - Depende: T-180

- [ ] **T-186** | Backend | Remove dead legacy code
  - Criterio: barberia_id routes
  - Depende: T-185

- [ ] **T-187** | Frontend | Remove unused deps zustand if unused
  - Criterio: Cleanup
  - Depende: T-185

- [ ] **T-188** | Backend | Security pass JWT secrets validation
  - Criterio: Fail prod defaults
  - Depende: T-185

- [ ] **T-189** | Infra | PM2 start all apps doc verified
  - Criterio: PM2-ECOSYSTEM
  - Depende: T-185

- [ ] **T-190** | Docs | CHANGELOG.md v1.0.0 local ready
  - Criterio: Release note
  - Depende: T-185


---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
