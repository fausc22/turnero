# Dependencias npm — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [TECH-STACK.md](./TECH-STACK.md) |
| Bloquea a | package.json |

---

## backend/package.json

### dependencies
| Paquete | Uso |
|---------|-----|
| express | API |
| mysql2 | MySQL pool |
| zod | Validación |
| jsonwebtoken | JWT |
| bcrypt | Passwords |
| axios | MP API |
| winston | Logs |
| cors | CORS |
| helmet | Security headers |
| express-rate-limit | Rate limit público |
| nodemailer | Email |
| @whiskeysockets/baileys | WhatsApp |
| sharp | Imágenes |
| multer | Upload |
| uuid | IDs tokens |
| date-fns | Fechas |
| dotenv | Env |

### devDependencies
| Paquete | Uso |
|---------|-----|
| typescript | TS |
| tsx / ts-node-dev | Dev |
| jest | Tests |
| supertest | HTTP tests |
| @types/* | Types |

---

## frontend / panel / panel-super (compartido)

### dependencies
| Paquete | Uso |
|---------|-----|
| next | Framework |
| react, react-dom | UI |
| tailwindcss | Estilos |
| @tanstack/react-query | Data |
| axios | HTTP |
| zod | Validación |
| react-hook-form | Forms |
| @hookform/resolvers | Zod RHF |
| framer-motion | Animaciones |
| lucide-react | Iconos |
| date-fns | Fechas |
| clsx, tailwind-merge | className |
| class-variance-authority | Variants |
| @radix-ui/* | Primitives shadcn |
| recharts | Solo panel stats |
| nuqs | Solo panel URL state |
| @microsoft/fetch-event-source | SSE panel |

### devDependencies
| Paquete | Uso |
|---------|-----|
| typescript | TS |
| eslint, eslint-config-next | Lint |
| @playwright/test | E2E (raíz o panel) |

---

## Raíz monorepo

| Paquete | Uso |
|---------|-----|
| concurrently | dev all apps |
| pm2 | ecosystem |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
