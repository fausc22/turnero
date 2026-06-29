# Backup y restore por tenant — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [REUSE-CARRITO.md](../03-stack/REUSE-CARRITO.md) |

---

## Backup single tenant

```bash
mysqldump -u root -p tuturno_peluqueria_naz \
  > backups/tuturno_peluqueria_naz_$(date +%Y%m%d).sql
```

Incluir uploads:

```bash
tar czf backups/tenant_1_media.tar.gz uploads/tenants/1/
```

---

## Backup control plane

```bash
mysqldump -u root -p tuturno_admin > backups/tuturno_admin_$(date +%Y%m%d).sql
```

---

## Restore tenant

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tuturno_peluqueria_naz"
mysql -u root -p tuturno_peluqueria_naz < backup.sql
```

Verificar registro en `tenants.db_name`.

---

## Runbook

Patrón detallado: carrito `docs/RUNBOOK-BACKUP-RESTORE-TENANTS.md`

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
