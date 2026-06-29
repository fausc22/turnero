# Stack tecnológico — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [DEPENDENCIES.md](./DEPENDENCIES.md) |
| Bloquea a | package.json de cada app |

---

## Versiones objetivo

| Capa | Tecnología | Versión |
|------|------------|---------|
| Runtime | Node.js | ≥ 20 LTS |
| Backend | Express | 4.x |
| Backend lang | TypeScript | 5.x |
| DB | MySQL | 8.0+ |
| DB driver | mysql2 | 3.x |
| Frontend | Next.js | 16.x |
| UI | React | 19.x |
| CSS | Tailwind CSS | 4.x |
| Validación | Zod | 3.x / 4.x |
| Forms | react-hook-form | 7.x |
| Data fetching | TanStack Query | 5.x |
| HTTP client | Axios | 1.x |
| Animaciones | Framer Motion | 11.x |
| Charts | Recharts | 2.x |
| UI primitives | Radix UI + shadcn | latest |
| Icons | lucide-react | latest |
| Auth | jsonwebtoken + bcrypt | — |
| Logging | Winston | 3.x |
| Tests | Jest + Supertest | 29.x |
| E2E | Playwright | 1.x |
| Pagos | Mercado Pago REST | SDK o axios |
| WhatsApp | Baileys (@whiskeysockets/baileys) | latest stable |
| Email | Nodemailer | 6.x |
| Process manager | PM2 | 5.x |
| Date | date-fns | 3.x |
| URL state (panel) | nuqs | 2.x |

---

## Qué NO usar

| Evitar | Razón |
|--------|-------|
| HeroUI / PrimeReact | Estilo no alineado al design dark minimalista |
| ORM (Prisma) en v1 | Consistencia con planificador/carrito SQL directo; migración mental menor desde legacy |
| Path slug `[slug]` | Decisión subdominio |
| Zustand obligatorio | TanStack Query + Context suficiente; Zustand solo si estado UI complejo |
| Socket.io v1 | SSE suficiente |

---

## Apps y puertos

Ver [02-arquitectura/OVERVIEW.md](../02-arquitectura/OVERVIEW.md).

---

## Entorno local

- MySQL local (Homebrew / Docker)
- `/etc/hosts` para subdominios
- Mercado Pago sandbox tokens
- Baileys con sesión local (QR en terminal dev)

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
