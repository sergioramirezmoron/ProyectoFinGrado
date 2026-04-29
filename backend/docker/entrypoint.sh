#!/bin/bash
set -e

echo "📦 Instalando dependencias PHP..."
cd /var/www/html
composer install --optimize-autoloader --no-dev --no-interaction --no-scripts
composer dump-autoload --optimize --no-dev

echo "⚙️  Configurando variables de entorno..."
DEFAULT_CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$|^https://luxurycars\.up\.railway\.app$'
RAILWAY_FRONTEND_ORIGIN='^https://luxurycars\.up\.railway\.app$'
if [ -n "$CORS_ALLOW_ORIGIN" ]; then
    EFFECTIVE_CORS_ALLOW_ORIGIN="${CORS_ALLOW_ORIGIN}|${RAILWAY_FRONTEND_ORIGIN}"
else
    EFFECTIVE_CORS_ALLOW_ORIGIN="$DEFAULT_CORS_ALLOW_ORIGIN"
fi

cat > /var/www/html/.env.local << ENVEOF
DATABASE_URL=${DATABASE_URL}
JWT_PASSPHRASE=${JWT_PASSPHRASE:-changeme_railway}
APP_SECRET=${APP_SECRET}
APP_ENV=${APP_ENV:-prod}
CORS_ALLOW_ORIGIN='$EFFECTIVE_CORS_ALLOW_ORIGIN'
ENVEOF

echo "🔑 Generando claves JWT si no existen..."
mkdir -p /var/www/html/config/jwt
if [ ! -f /var/www/html/config/jwt/private.pem ]; then
    cd /var/www/html
    php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
    echo "✅ Claves JWT generadas."
else
    echo "✅ Claves JWT ya existen."
fi

echo "🔄 Limpiando caché de Symfony..."
php bin/console cache:clear --env=prod --no-debug || true
php bin/console cache:warmup --env=prod --no-debug || true

echo "⏳ Esperando a que MySQL esté listo..."
until php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
    sleep 2
done

echo "✅ MySQL listo. Comprobando estado de la base de datos..."
TABLES=$(php bin/console doctrine:query:sql "SHOW TABLES" 2>/dev/null | grep -c "Tables_in" || echo "0")

if [ "$TABLES" -eq "0" ]; then
    echo "📝 Base de datos nueva — ejecutando migraciones para crear tablas..."
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
else
    echo "📝 Base de datos existente — sincronizando historial de migraciones..."
    php bin/console doctrine:migrations:sync-metadata-storage --no-interaction || true
    php bin/console doctrine:migrations:version --add --all --no-interaction 2>/dev/null || true
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration
fi

echo "📁 Asegurando directorio de imágenes..."
mkdir -p /var/www/html/public/images/vehicles
chown -R www-data:www-data /var/www/html/public/images
chmod -R 775 /var/www/html/public/images

echo "🚀 Arrancando Apache..."
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* 2>/dev/null || true
a2enmod mpm_prefork 2>/dev/null || true
exec apache2-foreground
