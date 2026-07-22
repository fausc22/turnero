# Migraciones SQL versionadas — TuTurno

## Estructura

```
data/migrations/
  admin/NNN_descripcion.sql   # tuturno_admin
  tenant/NNN_descripcion.sql  # cada tenant.db_name
```

Ledger: tabla `schema_migrations` en `tuturno_admin` (versión + checksum SHA-256).

## Comandos

```bash
npm run migrate -w backend -- plan
npm run migrate -w backend -- dry-run
npm run migrate -w backend -- apply
npm run migrate -w backend -- apply --tenant=peluqueria-naz
npm run migrate -w backend -- apply --scope=admin
```

## Reglas

1. Archivos inmutables una vez aplicados (cambiar checksum aborta el runner).
2. Fallo en un tenant detiene el batch (exit != 0).
3. DDL MySQL: roll-forward + restore; no hay `down` automático.
4. Provisioning de tenants nuevos aplica `schema_tenant.sql` y marca migraciones tenant como aplicadas.
5. Backup obligatorio antes de `apply` en staging/prod.

## Legacy

Los scripts `migrate:idempotency`, `migrate:onboarding`, `migrate:notifications` se conservan por compatibilidad; preferir el runner unificado.
