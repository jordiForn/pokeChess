#!/usr/bin/env bash
set -euo pipefail

echo "=== PokeChess Docker — validación ==="

check() {
  local name="$1"
  shift
  if "$@"; then
    echo "[OK] $name"
  else
    echo "[FAIL] $name"
    exit 1
  fi
}

DNS_PORT="${DNS_PORT:-53}"

check "DNS pokechess.local" dig "@127.0.0.1" -p "$DNS_PORT" pokechess.local +short | grep -q '^10\.1\.0\.3$'
check "DNS api.pokechess.local" dig "@127.0.0.1" -p "$DNS_PORT" api.pokechess.local +short | grep -q '^10\.1\.0\.3$'
check "DNS db.pokechess.local" dig "@127.0.0.1" -p "$DNS_PORT" db.pokechess.local +short | grep -q '^10\.1\.0\.3$'

check "API /up" curl -sf -H 'Host: api.pokechess.local' http://127.0.0.1/up
check "API piezas" curl -sf -H 'Host: api.pokechess.local' http://127.0.0.1/api/v1/pieces | grep -q 'id'
check "Frontend Angular" curl -sf -H 'Host: pokechess.local' http://127.0.0.1/ | grep -q 'app-root'
check "phpMyAdmin proxy" curl -sf -H 'Host: db.pokechess.local' http://127.0.0.1/ | grep -qi 'phpmyadmin\|pma'

echo "=== Contenedores en red 10.1.0.0/24 ==="
docker compose ps

echo "=== Validación completada ==="
