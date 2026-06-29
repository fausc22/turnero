# QA Checklist local — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [DEFINITION-OF-DONE.md](../11-implementacion/DEFINITION-OF-DONE.md) |

> 101 ítems. Marcar `[x]` al verificar en local.

---


## Infra

- [ ] Infra-01: Node.js >= 20 instalado
- [ ] Infra-02: MySQL 8 corriendo
- [ ] Infra-03: /etc/hosts configurado según HOSTS-LOCAL.md
- [ ] Infra-04: npm install en backend, frontend, panel, panel-super
- [ ] Infra-05: npm run setup:db sin errores
- [ ] Infra-06: PM2 o concurrently levanta 4 procesos

## API

- [ ] API-01: GET /health retorna ok
- [ ] API-02: Request sin x-tenant-slug a tenant route retorna 400

## Super

- [ ] Super-01: Login super@tuturno.local funciona
- [ ] Super-02: Listar tenants muestra 2 demo
- [ ] Super-03: Crear tenant test-slug provisioning success
- [ ] Super-04: Suspender tenant retorna TENANT_SUSPENDED en API
- [ ] Super-05: Audit log registra creación tenant

## Auth

- [ ] Auth-01: Login admin@nazareno.local resuelve tenant peluqueria-naz
- [ ] Auth-02: JWT refresh funciona
- [ ] Auth-03: Token tenant rechazado en API super
- [ ] Auth-04: SUPER JWT rechazado en API tenant
- [ ] Auth-05: tenant_slug mismatch retorna 403

## Public

- [ ] Public-01: GET config peluqueria-naz retorna branding
- [ ] Public-02: GET servicios lista activos
- [ ] Public-03: GET profesionales lista
- [ ] Public-04: Tenant suspendido config retorna 403
- [ ] Public-05: page_status PAUSADA muestra mensaje cliente

## Avail

- [ ] Avail-01: Slots respetan horarios_operativos
- [ ] Avail-02: Bloqueo excluye slots
- [ ] Avail-03: Turno existente excluye overlap
- [ ] Avail-04: Duración 45min no slot imposible al cierre
- [ ] Avail-05: Anticipación mínima excluye slot próximo

## Reserva

- [ ] Reserva-01: POST reserva crea turno CONFIRMADO sin pago
- [ ] Reserva-02: POST reserva con pago crea PENDIENTE
- [ ] Reserva-03: Idempotency key no duplica turno
- [ ] Reserva-04: SLOT_TAKEN en concurrent booking
- [ ] Reserva-05: Cliente existente reutiliza por teléfono
- [ ] Reserva-06: Producto decrementa stock
- [ ] Reserva-07: Stock insuficiente retorna error

## ClienteUI

- [ ] ClienteUI-01: peluqueria-naz.localhost landing carga
- [ ] ClienteUI-02: Wizard 5 pasos completa reserva
- [ ] ClienteUI-03: Sticky footer muestra total
- [ ] ClienteUI-04: Sin slots empty state visible
- [ ] ClienteUI-05: Confirmación muestra .ics download
- [ ] ClienteUI-06: Dark theme legible mobile 375px
- [ ] ClienteUI-07: Accent color tenant aplicado

## Gestionar

- [ ] Gestionar-01: Link token cancela turno en ventana
- [ ] Gestionar-02: Cancel fuera ventana rechazada
- [ ] Gestionar-03: Reprogramar valida disponibilidad

## Panel

- [ ] Panel-01: Dashboard muestra turnos hoy
- [ ] Panel-02: Sidebar navega todas secciones
- [ ] Panel-03: Mobile bottom nav funciona
- [ ] Panel-04: Agenda día muestra turnos
- [ ] Panel-05: Agenda semana cambia fecha URL
- [ ] Panel-06: Crear turno manual desde slot vacío
- [ ] Panel-07: Cambiar estado turno CONFIRMADO→COMPLETADO
- [ ] Panel-08: Marcar NO_ASISTIO post grace
- [ ] Panel-09: SSE nueva reserva toast + refresh

## CRUD

- [ ] CRUD-01: Editar servicio persiste
- [ ] CRUD-02: Editar cliente persiste
- [ ] CRUD-03: Editar producto persiste
- [ ] CRUD-04: Crear profesional aparece en picker cliente
- [ ] CRUD-05: Horarios semanal guarda y afecta slots
- [ ] CRUD-06: Bloqueo guarda y afecta slots

## MP

- [ ] MP-01: Config token MP en panel guarda
- [ ] MP-02: Preference MP redirect funciona sandbox
- [ ] MP-03: Webhook simulado confirma turno
- [ ] MP-04: Página pago/exito muestra confirmación
- [ ] MP-05: Pago rechazado muestra error page

## Notif

- [ ] Notif-01: WhatsApp confirmación enviado
- [ ] Notif-02: Email confirmación si email provisto
- [ ] Notif-03: Reenviar confirmación desde panel
- [ ] Notif-04: Recordatorio 24h job (test fecha)
- [ ] Notif-05: notificaciones_enviadas no duplica

## Brand

- [ ] Brand-01: Upload logo visible en cliente
- [ ] Brand-02: Cambio color primario visible
- [ ] Brand-03: Preview personalización panel

## Stats

- [ ] Stats-01: Resumen turnos período correcto
- [ ] Stats-02: Gráfico servicios top renderiza
- [ ] Stats-03: No-show rate calcula

## Roles

- [ ] Roles-01: Profesional no accede config
- [ ] Roles-02: Profesional solo ve sus turnos
- [ ] Roles-03: Recepcionista no edita servicios
- [ ] Roles-04: Gerente CRUD usuarios

## CRM

- [ ] CRM-01: Ficha cliente historial turnos
- [ ] CRM-02: Notas internas guardan
- [ ] CRM-03: Tags cliente guardan

## Waitlist

- [ ] Waitlist-01: Alta lista espera public
- [ ] Waitlist-02: Cancel turno notifica waitlist

## Plans

- [ ] Plans-01: DEV_UNLIMITED desactivado test límite profesionales

## Sec

- [ ] Sec-01: Rate limit public activo
- [ ] Sec-02: JWT secrets no default en .env
- [ ] Sec-03: CORS bloquea origen no permitido

## Tests

- [ ] Tests-01: npm test backend pasa
- [ ] Tests-02: Playwright reserva E2E pasa
- [ ] Tests-03: Playwright panel E2E pasa

## Data

- [ ] Data-01: 2 tenants BD aisladas datos no cruzan
- [ ] Data-02: Seed demo turnos visibles

## Jobs

- [ ] Jobs-01: expirePendingTurnos cancela PENDIENTE viejo
- [ ] Jobs-02: Trial expiry job marca trial vencido

## Onboarding

- [ ] Onboarding-01: Wizard primer login gerente

## PM2

- [ ] PM2-01: pm2 restart all recupera apps
- [ ] PM2-02: Logs backend sin error crítico 5min

## Cross

- [ ] Cross-01: estetica-luna datos distintos peluqueria-naz
- [ ] Cross-02: Login estetica-luna no ve turnos naz

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
