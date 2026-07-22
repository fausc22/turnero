# Baseline reproducible — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | EN_CURSO |
| Última revisión | 2026-07-22 |
| Relacionado con | [DEPLOYMENT-OVERVIEW.md](./DEPLOYMENT-OVERVIEW.md) |

---

## Versiones pinneadas

| Componente | Versión soportada |
|------------|-------------------|
| Node.js | 24.x LTS (ver `.nvmrc`) |
| npm | 11.x (incluido con Node 24) |
| MySQL | 8.0.x |

Campo `engines` en `package.json` raíz: `"node": ">=20 <25"`.

---

## Comandos de baseline (checkout limpio)

```bash
# 1. Instalar desde lockfile
npm ci

# 2. Type-check backend
npm run type-check

# 3. Build monorepo (API + 3 Next.js)
npm run build

# 4. Unit tests (sin MySQL)
CI_SKIP_DB=true npm run test:unit -w backend

# 5. Suite completa (requiere MySQL + seeds)
npm run seed:refresh-demo -w backend
npm run test -w backend

# 6. E2E (requiere hosts locales + stack)
# npm run test:e2e

# 7. Auditoría de dependencias (informe, no auto-fix)
npm run audit:prod
```

Script consolidado: `./scripts/verify-baseline.sh`

---

## Artefactos PM2

Tras `npm run build`:

```bash
pm2 start ecosystem.config.cjs
# Procesos: tuturno-api, tuturno-web, tuturno-panel, tuturno-admin, tuturno-worker
# (scheduler se agrega en Fase 5)
```

---

## Fallos / deudas preexistentes (no deben empeorar)

Registrados en auditoría 2026-07-22. La implementación por fases debe cerrarlos sin introducir regresiones.

1. Sin CI (`.github/workflows` ausente).
2. Migraciones versionadas incompletas (`migrate-all-tenants` documentado, no implementado).
3. `/api/legacy` montado; JWT legacy con fallbacks inseguros.
4. Webhook MP sin validación de monto; firma sin ventana temporal.
5. Refresh panel/super no usa tokens almacenados; logout super incompleto.
6. Crons en proceso API; jobs `processing` sin recovery.
7. `/health` sin readiness de DB; API sin graceful shutdown.
8. Backups solo documentados; uploads en disco local.
9. `CI_SKIP_DB=true` reduce la suite a ~7 tests unitarios.
10. Advisories npm en axios, multer, sharp, tar (transitivo), next, nodemailer.

---

## Criterio de no-regresión

Cualquier PR de cierre productivo debe:

- Mantener `npm run type-check` y `npm run build` en verde.
- No reducir la cantidad de tests ejecutables sin DB.
- No reintroducir fallbacks JWT en producción.
- No montar legacy en producción por defecto.
