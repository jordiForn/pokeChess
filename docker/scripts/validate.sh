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

check "DNS app.local" dig @127.0.0.1 app.local +short | grep -q '^10\.1\.0\.3$'
check "DNS api.app.local" dig @127.0.0.1 api.app.local +short | grep -q '^10\.1\.0\.3$'
check "DNS db.app.local" dig @127.0.0.1 db.app.local +short | grep -q '^10\.1\.0\.3$'

check "API /up" curl -sf -H 'Host: api.app.local' http://127.0.0.1/up
check "API piezas" curl -sf -H 'Host: api.app.local' http://127.0.0.1/api/v1/pieces | grep -q 'id'
check "Frontend Angular" curl -sf -H 'Host: app.local' http://127.0.0.1/ | grep -q 'app-root'
check "phpMyAdmin proxy" curl -sf -H 'Host: db.app.local' http://127.0.0.1/ | grep -qi 'phpmyadmin\|pma'

echo "=== Contenedores en red 10.1.0.0/24 ==="
docker compose ps

echo "=== Ping interno (desde nginx) ==="
docker compose exec -T nginx ping -c1 10.1.0.4 >/dev/null
docker compose exec -T nginx ping -c1 10.1.0.5 >/dev/null
docker compose exec -T nginx ping -c1 10.1.0.6 >/dev/null

echo "=== Laravel → MariaDB ==="
docker compose exec -T php-fpm php artisan db:show

echo "=== Validación completada ==="
