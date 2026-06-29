#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"
TENANT_SLUG="${TENANT_SLUG:-peluqueria-naz}"
FECHA="${FECHA:-2026-06-15}"

echo "Verificando Fase 2 — API en $API_URL (tenant=$TENANT_SLUG)"

echo -n "GET /api/public/config ... "
CONFIG_RESP=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" "$API_URL/api/public/config")
echo "$CONFIG_RESP" | grep -q '"success":true' && echo "$CONFIG_RESP" | grep -q '"bookingEnabled":true' && echo "OK" || { echo "FAIL"; echo "$CONFIG_RESP"; exit 1; }

echo -n "GET /api/public/servicios ... "
SERV_RESP=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" "$API_URL/api/public/servicios")
echo "$SERV_RESP" | grep -q '"success":true' && echo "$SERV_RESP" | grep -q 'Corte' && echo "OK" || { echo "FAIL"; echo "$SERV_RESP"; exit 1; }

echo -n "GET /api/public/disponibilidad ... "
DISP_RESP=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" \
  "$API_URL/api/public/disponibilidad?fecha=$FECHA&servicioIds=1")
echo "$DISP_RESP" | grep -q '"slots"' && echo "OK" || { echo "FAIL"; echo "$DISP_RESP"; exit 1; }

SLOT_INICIO=$(echo "$DISP_RESP" | grep -o '"fechaInicio":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$SLOT_INICIO" ]; then
  echo "FAIL: no hay slots disponibles para $FECHA"
  exit 1
fi

IDEM_KEY=$(uuidgen | tr '[:upper:]' '[:lower:]')
TELEFONO="11$(date +%s | tail -c 8)"

echo -n "POST /api/public/reservas ... "
RESERVA_RESP=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEM_KEY" \
  "$API_URL/api/public/reservas" \
  -d "{\"servicioIds\":[1],\"fechaInicio\":\"$SLOT_INICIO\",\"cliente\":{\"nombre\":\"Test Verify\",\"telefono\":\"$TELEFONO\"},\"idempotencyKey\":\"$IDEM_KEY\"}")
echo "$RESERVA_RESP" | grep -q '"tokenGestion"' && echo "OK" || { echo "FAIL"; echo "$RESERVA_RESP"; exit 1; }

TOKEN=$(echo "$RESERVA_RESP" | grep -o '"tokenGestion":"[^"]*"' | head -1 | cut -d'"' -f4)

echo -n "GET /api/public/reservas/:token ... "
GET_RESP=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" "$API_URL/api/public/reservas/$TOKEN")
echo "$GET_RESP" | grep -q '"estado"' && echo "OK" || { echo "FAIL"; echo "$GET_RESP"; exit 1; }

echo -n "POST /api/public/reservas/:token/cancelar ... "
CANCEL_RESP=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
  "$API_URL/api/public/reservas/$TOKEN/cancelar")
echo "$CANCEL_RESP" | grep -q 'CANCELADO' && echo "OK" || { echo "FAIL"; echo "$CANCEL_RESP"; exit 1; }

echo "Verificación Fase 2 completada."
