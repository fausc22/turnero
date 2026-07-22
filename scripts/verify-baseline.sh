#!/usr/bin/env bash
# Baseline reproducible — no modifica datos productivos.
# Uso: ./scripts/verify-baseline.sh
# Opcional: SKIP_BUILD=1 SKIP_AUDIT=1 CI_SKIP_DB=true ./scripts/verify-baseline.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== TuTurno baseline ==="
echo "Node: $(node --version)"
echo "npm:  $(npm --version)"
if command -v mysql >/dev/null 2>&1; then
  echo "MySQL client: $(mysql --version)"
else
  echo "MySQL client: (no instalado)"
fi
echo ""

if [[ ! -f package-lock.json ]]; then
  echo "ERROR: falta package-lock.json — usar npm ci desde lockfile"
  exit 1
fi

echo "→ type-check (backend)"
npm run type-check

if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  echo "→ build (backend + frontends)"
  npm run build
else
  echo "→ build omitido (SKIP_BUILD=1)"
fi

echo "→ unit tests"
CI_SKIP_DB="${CI_SKIP_DB:-true}" npm run test:unit -w backend

if [[ "${CI_SKIP_DB:-true}" != "true" ]]; then
  echo "→ suite Jest completa (MySQL requerido)"
  npm run seed:refresh-demo -w backend || true
  npm run test -w backend
else
  echo "→ suite DB omitida (CI_SKIP_DB=${CI_SKIP_DB:-true})"
fi

if [[ "${SKIP_AUDIT:-}" != "1" ]]; then
  echo "→ npm audit --omit=dev (informativo; exit != 0 no aborta)"
  npm run audit:prod || echo "WARN: advisories presentes — triage en Fase 1/8"
else
  echo "→ audit omitido (SKIP_AUDIT=1)"
fi

echo ""
echo "Baseline checks OK."
echo "Ver docs/13-produccion/BASELINE.md para fallos preexistentes."
