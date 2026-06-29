#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"

echo "Verificando Fase 0 — API en $API_URL"

echo -n "GET /health ... "
curl -sf "$API_URL/health" | grep -q '"status"' && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "GET /api/public/health (x-tenant-slug: test) ... "
response=$(curl -s -H "x-tenant-slug: test" "$API_URL/api/public/health")
if echo "$response" | grep -qE '"ok"|TENANT_NOT_FOUND'; then
  echo "OK"
else
  echo "FAIL (respuesta inesperada: $response)"
  exit 1
fi

echo "Verificación Fase 0 completada."
