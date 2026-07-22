#!/usr/bin/env bash
# Backup admin + tenants activos + uploads.
# Uso: ./ops/backup/backup.sh
# Requiere: mysql client, mysqldump, variables DB_* (o archivo ops/backup/.env)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ -f ops/backup/.env ]]; then
  # shellcheck disable=SC1091
  set -a && source ops/backup/.env && set +a
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_ADMIN_NAME="${DB_ADMIN_NAME:-tuturno_admin}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
UPLOADS_PATH="${UPLOADS_PATH:-$ROOT/backend/uploads}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
STAMP="$(date +%Y%m%d_%H%M%S)"
DEST="$BACKUP_DIR/$STAMP"
mkdir -p "$DEST"

MYSQL_PWD="$DB_PASSWORD"
export MYSQL_PWD

echo "→ Backup admin $DB_ADMIN_NAME"
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --single-transaction --routines --triggers \
  "$DB_ADMIN_NAME" | gzip > "$DEST/admin_${DB_ADMIN_NAME}.sql.gz"

echo "→ Listando tenants activos"
mapfile -t TENANTS < <(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -N -e \
  "SELECT CONCAT(slug, ':', db_name) FROM ${DB_ADMIN_NAME}.tenants WHERE status='activo' AND db_name IS NOT NULL")

for entry in "${TENANTS[@]:-}"; do
  [[ -z "$entry" ]] && continue
  slug="${entry%%:*}"
  db="${entry#*:}"
  echo "→ Backup tenant $slug ($db)"
  mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --single-transaction --routines --triggers \
    "$db" | gzip > "$DEST/tenant_${slug}_${db}.sql.gz"
done

if [[ -d "$UPLOADS_PATH" ]]; then
  echo "→ Backup uploads"
  tar czf "$DEST/uploads.tar.gz" -C "$(dirname "$UPLOADS_PATH")" "$(basename "$UPLOADS_PATH")"
fi

(
  cd "$DEST"
  find . -type f ! -name 'MANIFEST.sha256' -print0 | sort -z | xargs -0 sha256sum > MANIFEST.sha256
)

echo "$STAMP" > "$BACKUP_DIR/LATEST"
echo "Backup OK → $DEST"

# Retención
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -exec rm -rf {} + 2>/dev/null || true
