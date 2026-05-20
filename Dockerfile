FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/digital-library-main/digital_library/frontend
COPY digital-library-main/digital_library/frontend/package*.json ./
RUN npm install
COPY digital-library-main/digital_library/frontend/ ./
RUN npm run build

FROM composer:2 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

FROM php:8.2-cli
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libzip-dev unzip \
    && docker-php-ext-install mysqli \
    && rm -rf /var/lib/apt/lists/*

COPY . /app
COPY --from=composer-builder /app/vendor /app/vendor
COPY --from=frontend-builder /app/digital-library-main/digital_library/frontend/build /app/digital-library-main/digital_library/frontend/build

RUN mkdir -p /app/logs /app/uploads/books /app/uploads/covers

EXPOSE 8080

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t digital-library-main/digital_library/frontend/build router.php"]
