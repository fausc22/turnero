# Decision log (ADR) — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [02-arquitectura/OVERVIEW.md](../02-arquitectura/OVERVIEW.md) |
| Bloquea a | Consistencia futura |

---

## ADR-001: Subdominio para cliente, no path slug

**Estado:** Aceptado  
**Contexto:** Usuario prefiere `peluqueria.localhost` vs `/peluqueria`  
**Decisión:** Tenant en subdominio; slug interno en BD = subdominio  
**Consecuencias:** Middleware Host, wildcard SSL prod, /etc/hosts dev  

---

## ADR-002: Database-per-tenant

**Estado:** Aceptado  
**Contexto:** Legacy shared DB; planificador/carrito migran a este modelo  
**Decisión:** `tuturno_admin` + `tuturno_{slug}`  
**Consecuencias:** Provisioning obligatorio; no migrar BD legacy shared  

---

## ADR-003: Tres frontends Next.js

**Estado:** Aceptado  
**Contexto:** carrito usa tienda + panel + superpanel separados  
**Decisión:** frontend + panel + panel-super  
**Consecuencias:** Más repos npm; CORS multi-origin  

---

## ADR-004: MySQL + SQL directo (no Prisma v1)

**Estado:** Aceptado  
**Contexto:** Consistencia planificador/carrito; legacy mysql2  
**Decisión:** mysql2 + repositories  
**Consecuencias:** Migrations SQL manuales  

---

## ADR-005: WhatsApp via Baileys

**Estado:** Aceptado  
**Contexto:** Ya usado en planificador/elchalito  
**Decisión:** Self-hosted Baileys, cola worker  
**Consecuencias:** Ops QR session; no Meta Cloud API v1  

---

## ADR-006: SUPER_JWT separado

**Estado:** Aceptado  
**Contexto:** Seguridad planificador  
**Decisión:** Secret distinto para super admin  
**Consecuencias:** Dos flujos auth en backend  

---

## ADR-007: SSE over Socket.io v1

**Estado:** Aceptado  
**Contexto:** carrito SSE suficiente para notificaciones unidireccionales  
**Decisión:** SSE para turno.created  
**Consecuencias:** fetch-event-source en panel  

---

## ADR-008: Dark-first UI shadcn

**Estado:** Aceptado  
**Contexto:** Usuario quiere minimalista profesional dark  
**Decisión:** shadcn/Radix + tokens dark; no HeroUI  
**Consecuencias:** Rediseño completo vs legacy  

---

## ADR-009: Login panel sin slug en URL

**Estado:** Aceptado  
**Contexto:** panel.localhost único para todos los locales  
**Decisión:** tenant_user_index + JWT tenant_slug  
**Consecuencias:** Tabla índice en admin  

---

## ADR-010: Alcance completo local (no MVP)

**Estado:** Aceptado  
**Contexto:** Usuario requiere sistema 100% funcional para test local  
**Decisión:** 11 fases incluyendo tests, WhatsApp, stats, roles  
**Consecuencias:** ~10-14 semanas estimadas  

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
