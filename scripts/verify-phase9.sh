#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Verificando Fase 9 — Testing"

echo "→ Refrescando slots demo..."
npm run seed:refresh-demo -w backend

if [ "${CI_SKIP_DB:-}" = "true" ]; then
  echo "CI_SKIP_DB=true — solo tests unitarios y mocks"
  npm run test:unit -w backend
else
  echo "→ Jest (unit + integration + http)..."
  npm run test -w backend
fi

if [ "${PLAYWRIGHT:-}" = "1" ]; then
  echo "→ Playwright E2E (requiere npm run dev en otra terminal o CI)..."
  npm run test:e2e
else
  echo "Omitiendo E2E (export PLAYWRIGHT=1 para incluir npm run test:e2e)"
fi

echo ""
echo "Fase 9 checks OK."
