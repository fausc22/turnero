#!/usr/bin/env bash
set -euo pipefail

HOSTS=(
  "api.localhost"
  "panel.localhost"
  "admin.localhost"
  "peluqueria-naz.localhost"
  "estetica-luna.localhost"
)

echo "Verificando resolución DNS local..."
failed=0

for host in "${HOSTS[@]}"; do
  if ping -c1 -t1 "$host" >/dev/null 2>&1; then
    echo "  OK  $host"
  else
    echo "  FAIL $host — agregar a /etc/hosts (ver docs/12-dev-local/HOSTS-LOCAL.md)"
    failed=1
  fi
done

if [ "$failed" -eq 1 ]; then
  exit 1
fi

echo "Todos los hosts resuelven correctamente."
