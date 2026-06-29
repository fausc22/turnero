#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"
FRONTEND_URL="${FRONTEND_URL:-http://peluqueria-naz.localhost:4010}"
TENANT_SLUG="${TENANT_SLUG:-peluqueria-naz}"

echo "Verificando Fase 3 — Frontend en $FRONTEND_URL (API $API_URL)"

echo -n "GET landing (/) ... "
LANDING=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: ${TENANT_SLUG}.localhost:4010" "$FRONTEND_URL/")
[ "$LANDING" = "200" ] && echo "OK" || { echo "FAIL ($LANDING)"; exit 1; }

echo -n "GET /reservar ... "
RESERVAR=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: ${TENANT_SLUG}.localhost:4010" "$FRONTEND_URL/reservar")
[ "$RESERVAR" = "200" ] && echo "OK" || { echo "FAIL ($RESERVAR)"; exit 1; }

echo -n "GET API config (frontend dependency) ... "
CONFIG=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" "$API_URL/api/public/config")
echo "$CONFIG" | grep -q '"bookingEnabled":true' && echo "OK" || { echo "FAIL"; exit 1; }

echo ""
echo "Verificación automática Fase 3 completada."
echo "Manual: abrir $FRONTEND_URL → Reservar → 5 pasos → confirmación → gestionar turno"
