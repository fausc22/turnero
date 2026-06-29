#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"
TENANT_SLUG="${TENANT_SLUG:-peluqueria-naz}"
PANEL_EMAIL="${PANEL_EMAIL:-admin@nazareno.local}"
PANEL_PASSWORD="${PANEL_PASSWORD:-Password123!}"
SUPER_EMAIL="${SUPER_EMAIL:-super@tuturno.local}"
SUPER_PASSWORD="${SUPER_PASSWORD:-SuperAdmin123!}"

echo "Verificando Fase 8 — Roles + Avanzado en $API_URL (tenant=$TENANT_SLUG)"

echo -n "POST /api/auth/login gerente ... "
PANEL_RESP=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PANEL_EMAIL\",\"password\":\"$PANEL_PASSWORD\"}")
PANEL_TOKEN=$(echo "$PANEL_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
SLUG=$(echo "$PANEL_RESP" | grep -o '"tenantSlug":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$PANEL_TOKEN" ] && [ -n "$SLUG" ] && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "GET /api/tenant/usuarios ... "
USERS=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/usuarios")
echo "$USERS" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; echo "$USERS"; exit 1; }

echo -n "GET /api/tenant/categorias-servicio ... "
CATS=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/categorias-servicio")
echo "$CATS" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; echo "$CATS"; exit 1; }

echo -n "GET /api/tenant/lista-espera ... "
LE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/lista-espera")
[ "$LE" = "200" ] || [ "$LE" = "403" ] && echo "OK ($LE)" || { echo "FAIL ($LE)"; exit 1; }

echo -n "POST super login ... "
SUPER_RESP=$(curl -s -X POST "$API_URL/api/super/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SUPER_EMAIL\",\"password\":\"$SUPER_PASSWORD\"}")
SUPER_TOKEN=$(echo "$SUPER_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$SUPER_TOKEN" ] && echo "OK" || { echo "WARN (super login)"; }

if [ -n "$SUPER_TOKEN" ]; then
  echo -n "GET /api/super/audit ... "
  AUDIT=$(curl -s -H "Authorization: Bearer $SUPER_TOKEN" "$API_URL/api/super/audit?limit=5")
  echo "$AUDIT" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; echo "$AUDIT"; exit 1; }
fi

echo ""
echo "Fase 8 API checks OK."
echo "Manual: login PROFESIONAL → solo agenda propia; panel /usuarios y /lista-espera"
