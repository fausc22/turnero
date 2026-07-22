#!/usr/bin/env bash
# Verifica el último backup (checksum + presencia de archivos).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
LATEST_FILE="$BACKUP_DIR/LATEST"

if [[ ! -f "$LATEST_FILE" ]]; then
  echo "ERROR: no hay LATEST en $BACKUP_DIR"
  exit 1
fi

STAMP=$(cat "$LATEST_FILE")
DEST="$BACKUP_DIR/$STAMP"
if [[ ! -d "$DEST" ]]; then
  echo "ERROR: falta directorio $DEST"
  exit 1
fi

AGE_HOURS=$(( ( $(date +%s) - $(stat -f %m "$DEST" 2>/dev/null || stat -c %Y "$DEST") ) / 3600 ))
MAX_AGE="${BACKUP_MAX_AGE_HOURS:-26}"

echo "Latest backup: $STAMP (age ${AGE_HOURS}h)"
(cd "$DEST" && sha256sum -c MANIFEST.sha256)

if (( AGE_HOURS > MAX_AGE )); then
  echo "ERROR: backup demasiado viejo (> ${MAX_AGE}h) — RPO incumplido"
  exit 2
fi

echo "Backup verify OK"
