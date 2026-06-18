#!/usr/bin/env bash
set -uo pipefail

echo "=== PokeChess Docker — validación ==="

DNS_PORT="${DNS_PORT:-1053}"
FAILED=0

ok()   { echo "[OK] $1"; }
fail() { echo "[FAIL] $1"; FAILED=1; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Comando no encontrado: $1"
    exit 1
  fi
}

require_cmd dig
require_cmd curl
require_cmd docker

# --- DNS (opcional: SKIP_DNS=1 si solo usas /etc/hosts) ---
if [[ "${SKIP_DNS:-0}" != "1" ]]; then
  if dig "@127.0.0.1" -p "$DNS_PORT" pokechess.local +short 2>/dev/null | grep -q '^10\.1\.0\.3$'; then
    ok "DNS pokechess.local (puerto $DNS_PORT)"
  else
    fail "DNS pokechess.local (puerto $DNS_PORT) — prueba: dig @127.0.0.1 -p $DNS_PORT pokechess.local +short"
  fi

  if dig "@127.0.0.1" -p "$DNS_PORT" api.pokechess.local +short 2>/dev/null | grep -q '^10\.1\.0\.3$'; then
    ok "DNS api.pokechess.local"
  else
    fail "DNS api.pokechess.local"
  fi

  if dig "@127.0.0.1" -p "$DNS_PORT" db.pokechess.local +short 2>/dev/null | grep -q '^10\.1\.0\.3$'; then
    ok "DNS db.pokechess.local"
  else
    fail "DNS db.pokechess.local"
  fi
else
  echo "[SKIP] Comprobaciones DNS (SKIP_DNS=1)"
fi

# --- HTTP → HTTPS ---
if curl -sI -H 'Host: pokechess.local' http://127.0.0.1/ 2>/dev/null | grep -qi 'location:.*https://'; then
  ok "Redirección HTTP → HTTPS"
else
  fail "Redirección HTTP → HTTPS"
fi

# --- HTTPS (certificado autofirmado: -k) ---
if curl -sk -f -H 'Host: api.pokechess.local' https://127.0.0.1/up >/dev/null 2>&1; then
  ok "API /up"
else
  fail "API /up — prueba: curl -sk -H 'Host: api.pokechess.local' https://127.0.0.1/up"
fi

if curl -sk -f -H 'Host: api.pokechess.local' https://127.0.0.1/api/v1/pieces 2>/dev/null | grep -q 'id'; then
  ok "API piezas (subdominio)"
else
  fail "API piezas (subdominio)"
fi

if curl -sk -f -H 'Host: pokechess.local' https://127.0.0.1/api/v1/pieces 2>/dev/null | grep -q 'id'; then
  ok "API piezas (mismo origen /api/)"
else
  fail "API piezas (mismo origen /api/)"
fi

if curl -sk -f -H 'Host: pokechess.local' https://127.0.0.1/ 2>/dev/null | grep -q 'app-root'; then
  ok "Frontend Angular"
else
  fail "Frontend Angular — prueba: curl -sk -H 'Host: pokechess.local' https://127.0.0.1/ | grep app-root"
fi

if curl -sk -f -H 'Host: db.pokechess.local' https://127.0.0.1/ 2>/dev/null | grep -qi 'phpmyadmin\|pma'; then
  ok "phpMyAdmin proxy"
else
  fail "phpMyAdmin proxy"
fi

# --- Laravel → MariaDB ---
echo ""
echo "=== Laravel → MariaDB ==="
if docker compose exec -T php-fpm php artisan db:show >/dev/null 2>&1; then
  ok "Laravel conecta a MariaDB"
  docker compose exec -T php-fpm php artisan db:show 2>/dev/null | head -5
else
  fail "Laravel → MariaDB (docker compose exec php-fpm php artisan db:show)"
fi

echo ""
echo "=== Contenedores ==="
docker compose ps

echo ""
if [[ "$FAILED" -eq 0 ]]; then
  echo "=== Validación completada: TODO OK ==="
  exit 0
else
  echo "=== Validación completada: HAY ERRORES ==="
  echo "Sugerencias:"
  echo "  - Solo /etc/hosts:  SKIP_DNS=1 ./docker/scripts/validate.sh"
  echo "  - DNS en puerto 53: DNS_PORT=53 ./docker/scripts/validate.sh"
  exit 1
fi
