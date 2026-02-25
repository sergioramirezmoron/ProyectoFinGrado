FROM php:8.2-apache

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar Apache: habilitar mod_rewrite y apuntar al public/ de Symfony
RUN a2enmod rewrite

COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Copiar composer files primero (aprovecha cache de Docker)
COPY composer.json composer.lock ./

# Instalar dependencias PHP en modo producción (sin dev)
RUN composer install --optimize-autoloader --no-scripts --no-interaction

# Copiar el resto del proyecto
COPY . .

# Ejecutar scripts post-install de Composer (cache warmup, etc.)
RUN composer run-script post-install-cmd --no-interaction || true

# Permisos para var/ (logs, cache)
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var/ \
    && chmod -R 775 var/

# Limpiar y calentar caché de Symfony en prod
RUN php bin/console cache:clear --env=prod --no-debug || true \
    && php bin/console cache:warmup --env=prod --no-debug || true

# Copiar y dar permisos al entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
