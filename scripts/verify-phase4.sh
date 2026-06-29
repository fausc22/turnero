#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"
PANEL_URL="${PANEL_URL:-http://panel.localhost:4011}"
TENANT_SLUG="${TENANT_SLUG:-peluqueria-naz}"
FECHA="${FECHA:-2026-06-16}"
PANEL_EMAIL="${PANEL_EMAIL:-admin@nazareno.local}"
PANEL_PASSWORD="${PANEL_PASSWORD:-Password123!}"

echo "Verificando Fase 4 — Panel en $PANEL_URL (API $API_URL, tenant=$TENANT_SLUG)"

echo -n "GET panel /login ... "
LOGIN_PAGE=$(curl -s -o /dev/null -w "%{http_code}" "$PANEL_URL/login")
[ "$LOGIN_PAGE" = "200" ] && echo "OK" || { echo "FAIL ($LOGIN_PAGE)"; exit 1; }

echo -n "POST /api/auth/login (panel) ... "
PANEL_RESP=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PANEL_EMAIL\",\"password\":\"$PANEL_PASSWORD\"}")
PANEL_TOKEN=$(echo "$PANEL_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
SLUG=$(echo "$PANEL_RESP" | grep -o '"tenantSlug":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$PANEL_TOKEN" ] || [ -z "$SLUG" ]; then
  echo "FAIL"
  echo "$PANEL_RESP"
  exit 1
fi
echo "OK"

FROM="${FECHA}T00:00:00.000Z"
TO="${FECHA}T23:59:59.999Z"

echo -n "GET /api/tenant/agenda ... "
AGENDA_BEFORE=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/agenda?from=$FROM&to=$TO")
echo "$AGENDA_BEFORE" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; echo "$AGENDA_BEFORE"; exit 1; }

echo -n "GET /api/public/disponibilidad ... "
DISP_RESP=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" \
  "$API_URL/api/public/disponibilidad?fecha=$FECHA&servicioIds=1")
SLOT_INICIO=$(echo "$DISP_RESP" | grep -o '"fechaInicio":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -z "$SLOT_INICIO" ]; then
  echo "FAIL (sin slots; probar npm run seed:refresh-demo -w backend)"
  exit 1
fi
echo "OK"

IDEM_KEY=$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || cat /proc/sys/kernel/random/uuid)
TELEFONO="11$(date +%s | tail -c 8)"

echo -n "POST /api/public/reservas (reserva online) ... "
RESERVA_RESP=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEM_KEY" \
  "$API_URL/api/public/reservas" \
  -d "{\"servicioIds\":[1],\"fechaInicio\":\"$SLOT_INICIO\",\"cliente\":{\"nombre\":\"Verify Fase4\",\"telefono\":\"$TELEFONO\"},\"idempotencyKey\":\"$IDEM_KEY\"}")
echo "$RESERVA_RESP" | grep -q '"tokenGestion"' && echo "OK" || { echo "FAIL"; echo "$RESERVA_RESP"; exit 1; }

echo -n "Poll agenda hasta ver turno ... "
FOUND=0
for _ in $(seq 1 10); do
  AGENDA_AFTER=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
    "$API_URL/api/tenant/agenda?from=$FROM&to=$TO")
  if echo "$AGENDA_AFTER" | grep -q "$TELEFONO\|Verify Fase4"; then
    FOUND=1
    break
  fi
  sleep 0.5
done
[ "$FOUND" = "1" ] && echo "OK" || { echo "FAIL"; echo "$AGENDA_AFTER"; exit 1; }

echo -n "GET panel /agenda ... "
AGENDA_PAGE=$(curl -s -o /dev/null -w "%{http_code}" "$PANEL_URL/agenda")
[ "$AGENDA_PAGE" = "200" ] || [ "$AGENDA_PAGE" = "307" ] && echo "OK ($AGENDA_PAGE)" || { echo "FAIL ($AGENDA_PAGE)"; exit 1; }

echo ""
echo "Verificación automática Fase 4 completada."
echo "Manual: reserva en cliente → agenda panel sin refresh + toast SSE"
echo "Manual: drag-drop turno, CRUD clientes/servicios, horarios/bloqueos"
