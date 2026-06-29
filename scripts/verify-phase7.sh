#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"
TENANT_SLUG="${TENANT_SLUG:-peluqueria-naz}"
PANEL_EMAIL="${PANEL_EMAIL:-admin@nazareno.local}"
PANEL_PASSWORD="${PANEL_PASSWORD:-Password123!}"

echo "Verificando Fase 7 — Personalización + Stats en $API_URL (tenant=$TENANT_SLUG)"

echo -n "Migración onboarding ... "
(cd backend && npm run migrate:onboarding >/dev/null 2>&1) && echo "OK" || echo "WARN"

echo -n "POST /api/auth/login ... "
PANEL_RESP=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PANEL_EMAIL\",\"password\":\"$PANEL_PASSWORD\"}")
PANEL_TOKEN=$(echo "$PANEL_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
SLUG=$(echo "$PANEL_RESP" | grep -o '"tenantSlug":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$PANEL_TOKEN" ] && [ -n "$SLUG" ] && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "PUT tenant-estilos color ... "
EST=$(curl -s -X PUT -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  -H "Content-Type: application/json" \
  "$API_URL/api/tenant/tenant-estilos" \
  -d '{"colorPrimario":"#ff5500","colorAcento":"#ff8855"}')
echo "$EST" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; echo "$EST"; exit 1; }

echo -n "GET public config color ... "
CONFIG=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" "$API_URL/api/public/config")
echo "$CONFIG" | grep -q '#ff5500' && echo "OK" || echo "WARN (cache o sin estilos)"

FROM=$(date -u -v-30d +%Y-%m-%dT00:00:00.000Z 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%dT00:00:00.000Z)
TO=$(date -u +%Y-%m-%dT23:59:59.999Z)

echo -n "GET estadisticas/resumen ... "
STATS=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/estadisticas/resumen?from=$FROM&to=$TO")
echo "$STATS" | grep -q '"totalTurnos"' && echo "OK" || { echo "FAIL"; echo "$STATS"; exit 1; }

echo -n "GET tenant-meta ... "
META=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/tenant-meta")
echo "$META" | grep -q '"nombre"' && echo "OK" || { echo "FAIL"; exit 1; }

echo ""
echo "Checklist manual:"
echo "  1) Panel /personalizacion → subir logo → ver en cliente"
echo "  2) Panel /estadisticas → gráficos con datos demo"
echo "  3) Completar turno → puntos en ficha cliente"
echo "  4) Geocode con OPENCAGE_API_KEY → link mapa en landing"
echo ""
echo "Fase 7 verify script completado."
