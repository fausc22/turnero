# Estrategia de testing — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-06-12 |
| Relacionado con | [QA-CHECKLIST-LOCAL.md](./QA-CHECKLIST-LOCAL.md) |

---

## Pirámide

| Capa | Herramienta | Qué testear |
|------|-------------|-------------|
| Unit | Jest | geocode, template, trial, provisioning (Zod) |
| Integration | Jest (servicios) | reserva, disponibilidad, turnos, MP webhook, roles |
| HTTP | Jest + Supertest | auth, security JWT, cancelación por token |
| E2E | Playwright | Flujo reserva cliente, panel turno, super tenant |

---

## Backend setup

```
backend/
├── jest.config.js
├── tests/
│   ├── setup.ts
│   ├── helpers/
│   │   ├── tenantContext.ts
│   │   ├── http.ts
│   │   └── slots.ts
│   ├── unit/
│   ├── integration/
│   └── http/
│       ├── auth.test.ts
│       ├── security.test.ts
│       └── reservas-token.test.ts
```

Scripts:

```bash
npm run test -w backend           # todo
npm run test:unit -w backend
npm run test:integration -w backend
npm run test:http -w backend
```

`CI_SKIP_DB=true` omite tests que requieren MySQL (integration + http).

Antes de la suite con DB: `npm run seed:refresh-demo -w backend`.

---

## E2E setup

```
e2e/
├── playwright.config.ts
├── fixtures/auth.ts
└── specs/
    ├── reserva-cliente.spec.ts
    ├── panel-turno.spec.ts
    └── super-tenant.spec.ts
```

| Project | baseURL |
|---------|---------|
| cliente | `http://peluqueria-naz.localhost:4010` |
| panel | `http://panel.localhost:4011` |
| super | `http://admin.localhost:4012` |

Local: asumir `npm run dev` corriendo. CI: `webServer` levanta el monorepo.

```bash
npm run test:e2e
E2E_HEADED=1 npm run test:e2e -w e2e   # debug visual
```

Requiere `/etc/hosts` según [HOSTS-LOCAL.md](./HOSTS-LOCAL.md).

---

## Verificación Fase 9

```bash
./scripts/verify-phase9.sh
PLAYWRIGHT=1 ./scripts/verify-phase9.sh   # incluye E2E
```

---

## CI futuro

GitHub Actions: mysql service + npm test + playwright (fase prod).

---

## Cobertura mínima v1

- Auth tenant/super
- Disponibilidad casos borde
- Reserva + SLOT_TAKEN
- Webhook MP mock
- E2E happy path reserva

---

## Estado implementación

| Componente | Estado |
|------------|--------|
| Jest unit + integration | HECHO (17 suites, 41 tests) |
| Supertest HTTP | HECHO |
| Playwright E2E | HECHO (3 specs) |
| verify-phase9.sh | HECHO |

Ver [STATUS.md](../STATUS.md).
