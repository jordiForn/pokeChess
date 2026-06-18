#!/usr/bin/env bash
# Genera certificado autofirmado para todos los dominios locales de PokeChess.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CRT="pokechess.crt"
KEY="pokechess.key"
DAYS=825

if [[ -f "$CRT" && -f "$KEY" ]]; then
  echo "Ya existen $CRT y $KEY. Borra los archivos para regenerar."
  exit 0
fi

openssl req -x509 -nodes -newkey rsa:4096 \
  -keyout "$KEY" \
  -out "$CRT" \
  -days "$DAYS" \
  -subj "/CN=pokechess.local/O=PokeChess/C=ES" \
  -addext "subjectAltName=DNS:pokechess.local,DNS:www.pokechess.local,DNS:api.pokechess.local,DNS:db.pokechess.local"

chmod 600 "$KEY"
chmod 644 "$CRT"

echo "Certificado creado:"
echo "  $SCRIPT_DIR/$CRT"
echo "  $SCRIPT_DIR/$KEY"
