# Deployment overview — TuTurno (referencia futura)

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [02-arquitectura/SUBDOMAINS-AND-ROUTING.md](../02-arquitectura/SUBDOMAINS-AND-ROUTING.md) |

---

## Alcance

Documento de referencia. **Objetivo actual del proyecto es funcionalidad local completa**, no deploy prod.

---

## Arquitectura prod objetivo

| Componente | URL |
|------------|-----|
| API | https://api.{BASE_DOMAIN} |
| Panel | https://panel.{BASE_DOMAIN} |
| Super | https://admin.{BASE_DOMAIN} |
| Cliente | https://{slug}.{BASE_DOMAIN} |

---

## Infra sugerida

- VPS (patrón carrito/planificador)
- Nginx o Caddy reverse proxy
- PM2 procesos
- MySQL 8 managed o local
- Wildcard SSL `*.{BASE_DOMAIN}`

---

## Variables prod

- `NODE_ENV=production`
- Secrets fuertes JWT (32+ chars random)
- `DEV_UNLIMITED=false`
- SMTP real
- MP producción tokens por tenant

---

## Referencias hermanas

- carrito: `docs/DEPLOY-VPS-CADDY.md`, `PRODUCCION-PRIMEROS-PASOS.md`
- planificador: `backend/docs/QA_ARRANQUE_LOCAL_Y_PRODUCCION.md`

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
