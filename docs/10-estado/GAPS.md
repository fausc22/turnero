# Brechas (gaps) — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [INVENTARIO-LEGACY.md](./INVENTARIO-LEGACY.md), [11-implementacion/BACKLOG.md](../11-implementacion/BACKLOG.md) |
| Bloquea a | Priorización desarrollo |

---

## Críticos (bloquean producto)

| ID | Gap | Impacto |
|----|-----|---------|
| G1 | API pública inexistente; rutas requieren JWT | Cliente no puede reservar |
| G2 | Arquitectura BD compartida vs database-per-tenant | No escala SaaS |
| G3 | Routing path `[slug]` vs subdominio requerido | Modelo incorrecto |
| G4 | Sin provisioning ni control plane | No se pueden crear locales |
| G5 | Disponibilidad hardcodeada 9-18:30 | Horarios incorrectos |
| G6 | Sin panel-super | No operación SaaS |

---

## Altos

| ID | Gap | Impacto |
|----|-----|---------|
| G7 | Admin sin sidebar/nav | UX panel rota |
| G8 | CRUD solo create/delete, sin edit | Operación incompleta |
| G9 | Sin agenda calendario | Core panel faltante |
| G10 | Páginas pago MP no existen | Flujo pago roto |
| G11 | estilos/horarios API ausente | Branding y slots |
| G12 | SUPER_ADMIN sin UI ni seed | Plataforma incompleta |
| G13 | audit middleware no montado | Sin trazabilidad |

---

## Medios

| ID | Gap | Impacto |
|----|-----|---------|
| G14 | Sin WhatsApp/email | Valor SaaS reducido |
| G15 | Sin SSE | Panel desactualizado |
| G16 | Sin profesionales | Multi-barbero imposible |
| G17 | Sin estadísticas | Feature pro faltante |
| G18 | Sin tests | Calidad |
| G19 | Sin lista espera / reprogramar | Features documentadas |
| G20 | Roles BARBERO no restringidos | Seguridad |

---

## Bajos / deuda

| ID | Gap |
|----|-----|
| G21 | Zustand/Framer en package.json sin uso |
| G22 | env.example referenciado pero ausente |
| G23 | Sin git en monorepo |
| G24 | JWT secrets default inseguros |
| G25 | README backend sobrestima completitud |

---

## Mapa gap → fase

| Gap | Fase |
|-----|------|
| G1-G6 | 0-2 |
| G7-G13 | 3-4 |
| G14-G16 | 5-6 |
| G17-G20 | 7-8 |
| G21-G25 | 9-10 |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
