#!/bin/sh
set -e

cd /var/www/backend

echo "[php-fpm] Preparando directorios de Laravel..."
mkdir -p \
  storage/app/public \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "[php-fpm] Creando .env desde .env.example..."
    cp .env.example .env
  else
    echo "[php-fpm] Creando .env vacío..."
    touch .env
  fi
fi

if [ ! -f vendor/autoload.php ]; then
  echo "[php-fpm] Installing Composer dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
  echo "[php-fpm] Generating APP_KEY..."
  php artisan key:generate --force --no-interaction
fi

echo "[php-fpm] Waiting for MariaDB..."
until php -r "exit((int)!@fsockopen(getenv('DB_HOST') ?: 'mariadb', (int)(getenv('DB_PORT') ?: 3306), \$e, \$s, 2));" 2>/dev/null; do
  sleep 2
done

echo "[php-fpm] Running migrations..."
php artisan migrate --force --no-interaction

if [ "${SEED_DB:-true}" = "true" ]; then
  echo "[php-fpm] Seeding database..."
  php artisan db:seed --force --no-interaction || true
fi

chown -R www-data:www-data storage bootstrap/cache vendor 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "[php-fpm] Ready — starting PHP-FPM."
exec "$@"
