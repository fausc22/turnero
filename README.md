# TuTurno

Sistema SaaS multi-tenant de reserva de turnos para comercios locales (barberías, estética, consultorios, etc.).

## Documentación

Toda la especificación del producto, arquitectura, backlog e implementación está en **[docs/README.md](./docs/README.md)**.

Ver [docs/STATUS.md](./docs/STATUS.md) para el tablero de progreso.

## Estructura

```
turnero/
├── docs/           # Documentación completa
├── data/           # Schemas SQL (admin + tenant)
├── backend/        # API Express + TypeScript (:4013)
├── frontend/       # App cliente por subdominio (:4010)
├── panel/          # Panel del local (:4011)
├── panel-super/    # Super admin plataforma (:4012)
└── ecosystem.config.cjs
```

## Quick start

### 1. Hosts locales

Agregar entradas en `/etc/hosts` (ver [docs/12-dev-local/HOSTS-LOCAL.md](./docs/12-dev-local/HOSTS-LOCAL.md)):

```
127.0.0.1 api.localhost
127.0.0.1 panel.localhost
127.0.0.1 admin.localhost
127.0.0.1 peluqueria-naz.localhost
127.0.0.1 estetica-luna.localhost
```

Verificar: `./scripts/check-hosts.sh`

### 2. Dependencias

```bash
npm install
```

### 3. Base de datos (admin + seeds demo)

```bash
cp backend/.env.example backend/.env
# Editar credenciales MySQL si hace falta
npm run setup:db
```

Crea `tuturno_admin`, super admin (`super@tuturno.local` / `SuperAdmin123!`) y 2 tenants demo. Ver [docs/04-datos/SEED-DEV.md](./docs/04-datos/SEED-DEV.md).

### 4. Desarrollo

```bash
npm run dev
```

| Servicio | URL |
|----------|-----|
| API | http://api.localhost:4013/health |
| Cliente (tenant) | http://peluqueria-naz.localhost:4010 |
| Panel | http://panel.localhost:4011/login |
| Super admin | http://admin.localhost:4012/login |

**Credenciales demo panel:** `admin@nazareno.local` / `Password123!`

### 5. Verificación

```bash
./scripts/verify-phase0.sh
./scripts/verify-phase1.sh
./scripts/verify-phase2.sh
./scripts/verify-phase3.sh
./scripts/verify-phase4.sh
./scripts/verify-phase5.sh
./scripts/verify-phase6.sh
./scripts/verify-phase7.sh
./scripts/verify-phase8.sh
./scripts/verify-phase9.sh
```

### Roles y features avanzados (Fase 8)

```bash
./scripts/verify-phase8.sh
```

- Panel → `/usuarios` (CRUD usuarios, solo gerente)
- Panel → `/lista-espera` (plan profesional+)
- Servicios agrupados por categoría en `/servicios`
- panel-super → `/audit` (platform_audit_log)
- Trial expirado: job diario + `TRIAL_EXPIRED` en login

### Notificaciones (Fase 6)

```bash
# Migración cola admin (una vez)
npm run migrate:notifications -w backend
npm run seed:plantillas -w backend

# Worker WhatsApp + email (terminal aparte; escanear QR)
npm run worker:notifications -w backend
```

Configurá SMTP en `backend/.env` (Mailtrap en dev). Ver [docs/12-dev-local/ENV-VARIABLES.md](./docs/12-dev-local/ENV-VARIABLES.md).

### Personalización y estadísticas (Fase 7)

```bash
npm run migrate:onboarding -w backend   # una vez por tenant DB
./scripts/verify-phase7.sh
```

- Panel → `/personalizacion` (branding, uploads en `uploads/tenants/`)
- Panel → `/estadisticas` (Recharts)
- Geocode opcional: `OPENCAGE_API_KEY` en `backend/.env`

Para tenants demo ya provisionados sin horarios, ejecutar `npm run seed:refresh-demo -w backend` y `npm run migrate:idempotency -w backend` si aplica.

Fase 5 (pagos MP): configurar `MP_TEST_ACCESS_TOKEN` en `backend/.env` y guardar token en panel `/configuracion`.

### Testing (Fase 9)

```bash
npm run setup:db                              # prerequisito MySQL + hosts
npm run seed:refresh-demo -w backend          # slots demo estables
npm run test                                  # Jest: unit + integration + http
npm run dev                                   # otra terminal
npm run test:e2e                              # Playwright (3 specs)
./scripts/verify-phase9.sh                  # seed + jest; PLAYWRIGHT=1 incluye E2E
```

Variables útiles:

| Variable | Efecto |
|----------|--------|
| `CI_SKIP_DB=true` | Solo unit + mocks (sin MySQL) |
| `PLAYWRIGHT=1` | Incluir E2E en `verify-phase9.sh` |
| `E2E_HEADED=1` | Playwright con navegador visible |

Ver [docs/12-dev-local/TESTING-STRATEGY.md](./docs/12-dev-local/TESTING-STRATEGY.md).

## Por dónde empezar

1. Leer [docs/README.md](./docs/README.md)
2. Seguir [docs/11-implementacion/PHASE-0-SCAFFOLD.md](./docs/11-implementacion/PHASE-0-SCAFFOLD.md)
3. Marcar tareas en [docs/11-implementacion/BACKLOG.md](./docs/11-implementacion/BACKLOG.md)
