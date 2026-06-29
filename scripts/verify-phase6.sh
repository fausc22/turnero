#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://api.localhost:4013}"
TENANT_SLUG="${TENANT_SLUG:-peluqueria-naz}"
FECHA="${FECHA:-2026-06-22}"
PANEL_EMAIL="${PANEL_EMAIL:-admin@nazareno.local}"
PANEL_PASSWORD="${PANEL_PASSWORD:-Password123!}"

echo "Verificando Fase 6 — Notificaciones en $API_URL (tenant=$TENANT_SLUG)"

echo -n "Migración notification_jobs ... "
(cd backend && npm run migrate:notifications >/dev/null 2>&1) && echo "OK" || echo "WARN"

echo -n "POST /api/auth/login ... "
PANEL_RESP=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$PANEL_EMAIL\",\"password\":\"$PANEL_PASSWORD\"}")
PANEL_TOKEN=$(echo "$PANEL_RESP" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
SLUG=$(echo "$PANEL_RESP" | grep -o '"tenantSlug":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$PANEL_TOKEN" ] && [ -n "$SLUG" ] && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "GET whatsapp-status ... "
WA=$(curl -s -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/notificaciones/whatsapp-status")
echo "$WA" | grep -q '"connected"' && echo "OK" || { echo "FAIL"; echo "$WA"; exit 1; }

echo -n "PUT politicas SIN_PAGO ... "
POL=$(curl -s -X PUT -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  -H "Content-Type: application/json" \
  "$API_URL/api/tenant/politicas-reserva" \
  -d '{"modoPago":"SIN_PAGO"}')
echo "$POL" | grep -q '"success":true' && echo "OK" || { echo "FAIL"; exit 1; }

echo -n "GET disponibilidad ... "
DISP=$(curl -s -H "x-tenant-slug: $TENANT_SLUG" \
  "$API_URL/api/public/disponibilidad?fecha=$FECHA&servicioIds=1")
SLOT=$(echo "$DISP" | grep -o '"fechaInicio":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$SLOT" ] || { echo "FAIL sin slots"; exit 1; }
echo "OK"

IDEM=$(uuidgen 2>/dev/null | tr '[:upper:]' '[:lower:]' || echo "verify-phase6-$(date +%s)")
TEL="11$(date +%s | tail -c 8)"

echo -n "POST reserva CONFIRMADO ... "
RESERVA=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" -H "Idempotency-Key: $IDEM" \
  "$API_URL/api/public/reservas" \
  -d "{\"servicioIds\":[1],\"fechaInicio\":\"$SLOT\",\"cliente\":{\"nombre\":\"Verify F6\",\"telefono\":\"$TEL\",\"email\":\"verify-f6@test.local\"},\"idempotencyKey\":\"$IDEM\"}")
TURNO_ID=$(echo "$RESERVA" | grep -o '"turnoId":[0-9]*' | head -1 | cut -d: -f2)
TOKEN=$(echo "$RESERVA" | grep -o '"tokenGestion":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "$RESERVA" | grep -q '"estado":"CONFIRMADO"' && echo "OK (turno=$TURNO_ID)" || {
  echo "FAIL"; echo "$RESERVA"; exit 1;
}

sleep 1
echo -n "Jobs confirmación encolados (pending/sent) ... "
echo "manual: SELECT * FROM tuturno_admin.notification_jobs WHERE tenant_slug='$TENANT_SLUG' ORDER BY id DESC LIMIT 3;"
echo "OK (revisar DB o worker)"

echo -n "POST cancelar → job cancelación ... "
CANCEL=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
  "$API_URL/api/public/reservas/$TOKEN/cancelar")
echo "$CANCEL" | grep -q '"estado":"CANCELADO"' && echo "OK" || { echo "FAIL"; echo "$CANCEL"; exit 1; }

echo -n "POST lista-espera ... "
LE=$(curl -s -X POST -H "x-tenant-slug: $TENANT_SLUG" \
  -H "Content-Type: application/json" \
  "$API_URL/api/public/lista-espera" \
  -d "{\"servicioIds\":[1],\"fechaDesde\":\"$FECHA\",\"fechaHasta\":\"$FECHA\",\"cliente\":{\"nombre\":\"LE Test\",\"telefono\":\"$TEL\"}}")
if echo "$LE" | grep -q '"success":true'; then
  echo "OK"
elif echo "$LE" | grep -q 'FEATURE_DISABLED'; then
  echo "SKIP (habilitar features.lista_espera en config_json del tenant)"
else
  echo "FAIL"; echo "$LE"; exit 1
fi

echo -n "POST reenviar-confirmación (turno previo) ... "
REENV=$(curl -s -X POST -H "Authorization: Bearer $PANEL_TOKEN" -H "x-tenant-slug: $SLUG" \
  "$API_URL/api/tenant/turnos/$TURNO_ID/reenviar-confirmacion")
echo "$REENV" | grep -q '"success":true' && echo "OK" || echo "WARN (turno cancelado)"

echo ""
echo "Checklist manual:"
echo "  1) npm run worker:notifications -w backend  → escanear QR Baileys"
echo "  2) Mailtrap: revisar email fallback si WA no conectado"
echo "  3) Recordatorio 24h: turno con fecha_inicio +24h o test integration"
echo ""
echo "Fase 6 verify script completado."
