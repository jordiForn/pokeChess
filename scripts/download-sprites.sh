#!/usr/bin/env bash
# Descarga sprites oficiales empaquetados en el frontend (funciona sin internet en runtime).
set -euo pipefail

DIR="$(cd "$(dirname "$0")/../frontend/public/sprites/pokemon" && pwd)"
IDS=(19 52 56 57 67 68 93 94 143 289 448 475)
BASE="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"

mkdir -p "$DIR"

for id in "${IDS[@]}"; do
  echo "Descargando $id.png..."
  curl -fsSL "$BASE/$id.png" -o "$DIR/$id.png"
done

echo "Sprites listos en $DIR"
