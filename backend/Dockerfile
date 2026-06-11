FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    git \
    unzip \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo_mysql zip mbstring pcntl \
    && rm -rf /var/cache/apk/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --no-autoloader

COPY . .
RUN composer dump-autoload --optimize \
    && chmod -R 775 storage bootstrap/cache

ENV PORT=8080

EXPOSE 8080

CMD sh -c "php artisan migrate --force --no-interaction && php artisan serve --host=0.0.0.0 --port=${PORT}"
