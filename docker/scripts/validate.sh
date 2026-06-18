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

# Puerto DNS publicado en docker-compose (1053:53). Usa DNS_PORT=53 si mapeas 53:53.
DNS_PORT="${DNS_PORT:-1053}"
CURL="curl -sk"

check "DNS pokechess.local" dig "@127.0.0.1" -p "$DNS_PORT" pokechess.local +short | grep -q '^10\.1\.0\.3$'
check "DNS api.pokechess.local" dig "@127.0.0.1" -p "$DNS_PORT" api.pokechess.local +short | grep -q '^10\.1\.0\.3$'
check "DNS db.pokechess.local" dig "@127.0.0.1" -p "$DNS_PORT" db.pokechess.local +short | grep -q '^10\.1\.0\.3$'

check "Redirección HTTP → HTTPS" curl -sI -H 'Host: pokechess.local' http://127.0.0.1/ | grep -qi 'location: https://'

check "API /up" $CURL -H 'Host: api.pokechess.local' https://127.0.0.1/up
check "API piezas (subdominio)" $CURL -H 'Host: api.pokechess.local' https://127.0.0.1/api/v1/pieces | grep -q 'id'
check "API piezas (mismo origen)" $CURL -H 'Host: pokechess.local' https://127.0.0.1/api/v1/pieces | grep -q 'id'
check "Frontend Angular" $CURL -H 'Host: pokechess.local' https://127.0.0.1/ | grep -q 'app-root'
check "phpMyAdmin proxy" $CURL -H 'Host: db.pokechess.local' https://127.0.0.1/ | grep -qi 'phpmyadmin\|pma'

echo "=== Laravel → MariaDB ==="
docker compose exec -T php-fpm php artisan db:show

echo "=== Contenedores en red 10.1.0.0/24 ==="
docker compose ps

echo "=== Validación completada ==="
