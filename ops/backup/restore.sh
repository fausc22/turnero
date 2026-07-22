#!/usr/bin/env bash
# Restore desde un directorio de backup generado por backup.sh
# Uso: ./ops/backup/restore.sh backups/YYYYMMDD_HHMMSS [--admin-only] [--tenant=slug]
# PELIGRO: sobrescribe bases. Solo staging o recuperación autorizada.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

SRC="${1:-}"
shift || true
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "Usage: $0 backups/STAMP [--admin-only] [--tenant=slug]"
  exit 1
fi

if [[ -f ops/backup/.env ]]; then
  # shellcheck disable=SC1091
  set -a && source ops/backup/.env && set +a
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_ADMIN_NAME="${DB_ADMIN_NAME:-tuturno_admin}"
UPLOADS_PATH="${UPLOADS_PATH:-$ROOT/backend/uploads}"
MYSQL_PWD="$DB_PASSWORD"
export MYSQL_PWD

ADMIN_ONLY=false
TENANT_FILTER=""
for arg in "$@"; do
  case "$arg" in
    --admin-only) ADMIN_ONLY=true ;;
    --tenant=*) TENANT_FILTER="${arg#--tenant=}" ;;
  esac
done

echo "Verificando checksums..."
(
  cd "$SRC"
  sha256sum -c MANIFEST.sha256
)

ADMIN_DUMP=$(ls "$SRC"/admin_*.sql.gz | head -1)
echo "→ Restore admin"
gunzip -c "$ADMIN_DUMP" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER"

if [[ "$ADMIN_ONLY" == "true" ]]; then
  echo "Admin-only restore complete."
  exit 0
fi

for dump in "$SRC"/tenant_*.sql.gz; do
  [[ -f "$dump" ]] || continue
  base=$(basename "$dump")
  # tenant_SLUG_DBNAME.sql.gz
  rest="${base#tenant_}"
  rest="${rest%.sql.gz}"
  slug="${rest%%_*}"
  db="${rest#*_}"
  if [[ -n "$TENANT_FILTER" && "$slug" != "$TENANT_FILTER" ]]; then
    continue
  fi
  echo "→ Restore tenant $slug → $db"
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "CREATE DATABASE IF NOT EXISTS \`$db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
  gunzip -c "$dump" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$db"
done

if [[ -f "$SRC/uploads.tar.gz" ]]; then
  echo "→ Restore uploads → $UPLOADS_PATH"
  mkdir -p "$(dirname "$UPLOADS_PATH")"
  tar xzf "$SRC/uploads.tar.gz" -C "$(dirname "$UPLOADS_PATH")"
fi

echo "Restore OK from $SRC"
