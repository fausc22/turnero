# Backup / restore — TuTurno (runbook operativo)

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-07-22 |
| RPO inicial | ≤ 24 h (recomendado ≤ 1 h con cron horario) |
| RTO inicial | ≤ 4 h |

---

## Scripts

| Script | Acción |
|--------|--------|
| [`ops/backup/backup.sh`](../../ops/backup/backup.sh) | Dump admin + tenants activos + uploads + checksum |
| [`ops/backup/restore.sh`](../../ops/backup/restore.sh) | Restore verificado (staging / DR) |
| [`ops/backup/verify.sh`](../../ops/backup/verify.sh) | Valida LATEST y antigüedad |

Config opcional: `ops/backup/.env` (no versionar secretos).

```bash
chmod +x ops/backup/*.sh
# Cron ejemplo (diario 02:00):
# 0 2 * * * cd /srv/tuturno && ./ops/backup/backup.sh >> /var/log/tuturno-backup.log 2>&1
# 30 2 * * * cd /srv/tuturno && ./ops/backup/verify.sh
```

---

## Procedimiento restore (staging)

1. Detener API/worker/scheduler (`pm2 stop all` o equivalente).
2. `./ops/backup/verify.sh`
3. `./ops/backup/restore.sh backups/STAMP`
4. `npm run migrate -w backend -- plan` (sin drift).
5. Arrancar procesos y smoke tests.

---

## Off-host

Tras `backup.sh`, copiar `$BACKUP_DIR/$STAMP` a almacenamiento externo (S3/rsync). Cifrar en tránsito/reposo. No dejar dumps en el repo git.

---

## Incluir siempre

- `tuturno_admin`
- Cada `tenants.db_name` activo
- `$UPLOADS_PATH` (media)
- Opcional: sesión Baileys (`BAILEYS_AUTH_PATH`) si WhatsApp es crítico

---

## Rollback de datos

DDL no se revierte con migraciones `down`. Ante corrupción: restore desde backup + roll-forward de migraciones pendientes.
