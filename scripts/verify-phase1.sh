#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"

echo "Verificando Fase 1 — API en $API_URL"

echo -n "POST /api/super/auth/login ... "
SUPER_RESP=$(curl -s -X POST "$API_URL/api/super/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"super@tuturno.local","password":"SuperAdmin123!"}')
SUPER_TOKEN=$(echo "$SUPER_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$SUPER_TOKEN" ]; then
  echo "FAIL"
  echo "$SUPER_RESP"
  exit 1
fi
echo "OK"

echo -n "GET /api/super/tenants ... "
TENANTS_RESP=$(curl -s -H "Authorization: Bearer $SUPER_TOKEN" "$API_URL/api/super/tenants")
echo "$TENANTS_RESP" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "POST /api/auth/login (panel global) ... "
PANEL_RESP=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nazareno.local","password":"Password123!"}')
PANEL_TOKEN=$(echo "$PANEL_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
TENANT_SLUG=$(echo "$PANEL_RESP" | grep -o '"tenantSlug":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$PANEL_TOKEN" ] || [ -z "$TENANT_SLUG" ]; then
  echo "FAIL"
  echo "$PANEL_RESP"
  exit 1
fi
echo "OK (tenant=$TENANT_SLUG)"

echo -n "GET /api/tenant/health (autenticado) ... "
HEALTH_RESP=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $TENANT_SLUG" \
  "$API_URL/api/tenant/health")
echo "$HEALTH_RESP" | grep -q '"authenticated":true' && echo "OK" || { echo "FAIL"; echo "$HEALTH_RESP"; exit 1; }

echo "Verificación Fase 1 completada."
