# Estructura del monorepo — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [03-stack/TECH-STACK.md](../03-stack/TECH-STACK.md) |
| Bloquea a | Fase 0 scaffold |

---

## Árbol objetivo

```
turnero/
├── README.md
├── ecosystem.config.cjs
├── docs/
├── data/
│   ├── schema_admin.sql
│   ├── schema_tenant.sql
│   ├── seed_dev.sql
│   └── migrations/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── public/
│   │   │   ├── tenant/
│   │   │   └── super/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── workers/
│   │   ├── validations/
│   │   └── types/
│   ├── tests/
│   ├── scripts/
│   │   ├── setup-admin-db.ts
│   │   └── provision-tenant.ts
│   └── package.json
├── frontend/                 # App cliente (subdominio)
│   ├── app/
│   │   ├── page.tsx          # landing tenant
│   │   ├── reservar/
│   │   ├── confirmacion/
│   │   ├── pago/
│   │   └── gestionar/[token]/
│   ├── components/
│   ├── lib/
│   ├── middleware.ts         # extract slug from host
│   └── package.json
├── panel/                    # NUEVO — extraer de frontend/admin
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── agenda/
│   │   ├── turnos/
│   │   ├── clientes/
│   │   ├── servicios/
│   │   ├── productos/
│   │   ├── profesionales/
│   │   ├── horarios/
│   │   ├── personalizacion/
│   │   ├── estadisticas/
│   │   ├── configuracion/
│   │   └── usuarios/
│   └── package.json
├── panel-super/              # NUEVO
│   ├── app/
│   │   ├── login/
│   │   ├── tenants/
│   │   └── usuarios/
│   └── package.json
└── packages/                 # OPCIONAL fase 2
    └── ui/                   # design system compartido
```

---

## Qué hacer con código legacy

| Legacy | Acción |
|--------|--------|
| `frontend/app/[slug]/*` | Eliminar; reemplazar por middleware subdominio |
| `frontend/app/admin/*` | Migrar a `panel/` |
| `frontend/app/login` | Migrar a `panel/app/login` |
| `frontend/app/page.tsx` (lista barberías) | Eliminar o landing marketing futura |
| `backend/src/*` | Refactorizar a public/tenant/super; adaptar services |
| `data/schema.sql` | Evolucionar a `schema_tenant.sql` |
| `context/BarberiaContext` | Renombrar TenantContext en frontend |

---

## Paquete compartido UI (recomendado)

Inicialmente duplicar shadcn en frontend + panel + panel-super. En Fase 7 extraer a `packages/ui` con tokens dark.

---

## Scripts npm raíz (objetivo)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w backend\" \"npm run dev -w frontend\" \"npm run dev -w panel\" \"npm run dev -w panel-super\"",
    "setup:db": "npm run setup:admin -w backend && npm run seed:dev -w backend",
    "test": "npm run test -w backend"
  }
}
```

Usar npm workspaces o concurrently sin workspaces inicialmente.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
