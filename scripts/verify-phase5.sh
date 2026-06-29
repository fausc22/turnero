#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"
TENANT_SLUG="${TENANT_SLUG:-peluqueria-naz}"
FECHA="${FECHA:-2026-06-17}"
PANEL_EMAIL="${PANEL_EMAIL:-admin@nazareno.local}"
PANEL_PASSWORD="${PANEL_PASSWORD:-Password123!}"

echo "Verificando Fase 5 — Pagos MP en $API_URL (tenant=$TENANT_SLUG)"

echo -n "POST /api/auth/login ... "
PANEL_RESP=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PANEL_EMAIL\",\"password\":\"$PANEL_PASSWORD\"}")
PANEL_TOKEN=$(echo "$PANEL_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
SLUG=$(echo "$PANEL_RESP" | grep -o '"tenantSlug":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$PANEL_TOKEN" ] && [ -n "$SLUG" ] && echo "OK" || { echo "FAIL"; exit 1; }

MP_TOKEN="${MP_TEST_ACCESS_TOKEN:-TEST-TOKEN-DEV}"
echo -n "PUT politicas SEÑA + MP token ... "
POL_RESP=$(curl -s -X PUT -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  -H "Content-Type: application/json" \
  "$API_URL/api/tenant/politicas-reserva" \
  -d "{\"modoPago\":\"SEÑA_PORCENTAJE\",\"señaPorcentaje\":50,\"mpAccessToken\":\"$MP_TOKEN\"}")
echo "$POL_RESP" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; echo "$POL_RESP"; exit 1; }

echo -n "GET /api/public/config pagoOnlineDisponible ... "
CONFIG=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" "$API_URL/api/public/config")
echo "$CONFIG" | grep -q '"pagoOnlineDisponible":true' && echo "OK" || { echo "FAIL"; echo "$CONFIG"; exit 1; }

echo -n "GET disponibilidad ... "
DISP=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" \
  "$API_URL/api/public/disponibilidad?fecha=$FECHA&servicioIds=1")
SLOT=$(echo "$DISP" | grep -o '"fechaInicio":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$SLOT" ] || { echo "FAIL sin slots"; exit 1; }
echo "OK"

IDEM=$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || echo "verify-phase5-$(date +%s)")
TEL="11$(date +%s | tail -c 8)"

echo -n "POST reserva (PENDIENTE) ... "
RESERVA=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" -H "Idempotency-Key: $IDEM" \
  "$API_URL/api/public/reservas" \
  -d "{\"servicioIds\":[1],\"fechaInicio\":\"$SLOT\",\"cliente\":{\"nombre\":\"Verify F5\",\"telefono\":\"$TEL\"},\"idempotencyKey\":\"$IDEM\"}")
TURNO_ID=$(echo "$RESERVA" | grep -o '"turnoId":[0-9]*' | head -1 | cut -d: -f2)
TOKEN=$(echo "$RESERVA" | grep -o '"tokenGestion":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "$RESERVA" | grep -q '"estado":"PENDIENTE"' && echo "OK (turno=$TURNO_ID)" || {
  echo "FAIL (¿modo SIN_PAGO?)"
  echo "$RESERVA"
  exit 1
}

echo -n "POST preference ... "
if [ -z "${MP_TEST_ACCESS_TOKEN:-}" ]; then
  echo "SKIP (sin MP_TEST_ACCESS_TOKEN real; preference requiere token MP válido)"
else
  PREF=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
    -H "Content-Type: application/json" \
    "$API_URL/api/public/pagos/preference" \
    -d "{\"turnoId\":$TURNO_ID,\"tokenGestion\":\"$TOKEN\"}")
  echo "$PREF" | grep -q 'initPoint' && echo "OK" || { echo "FAIL"; echo "$PREF"; exit 1; }
fi

PAYMENT_ID=$((100000000 + RANDOM))
echo -n "Simular webhook approved ... "
WH=$(curl -s -X POST \
  "$API_URL/api/webhooks/mercadopago?topic=payment&id=$PAYMENT_ID&tenant=$TENANT_SLUG" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"payment\",\"data\":{\"id\":\"$PAYMENT_ID\"}}")
if echo "$WH" | grep -q '"success":true'; then
  echo "OK (live MP)"
elif [ -z "${MP_TEST_ACCESS_TOKEN:-}" ]; then
  echo "SKIP (usar npm run test:integration mp-webhook para simulación)"
else
  echo "WARN"; echo "$WH"
fi

echo -n "GET /api/tenant/pagos ... "
PAGOS=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/pagos")
echo "$PAGOS" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; exit 1; }

echo ""
echo "Verificación automática Fase 5 completada."
echo "Manual: reserva → MP sandbox → /pago/exito → confirmación"
echo "Webhook real local: ngrok tunnel a :4013 (ver TROUBLESHOOTING.md)"
