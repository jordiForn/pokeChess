#!/bin/sh
set -e

echo "PokeChess API starting on port ${PORT:-8080}..."

php artisan config:clear --no-interaction 2>/dev/null || true

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
