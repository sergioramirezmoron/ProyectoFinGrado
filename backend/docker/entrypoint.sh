#!/bin/bash
set -e

echo "⚙️  Configurando variables de entorno..."
cat > /var/www/html/.env.local << ENVEOF
DATABASE_URL=${DATABASE_URL}
JWT_PASSPHRASE=${JWT_PASSPHRASE:-changeme_railway}
APP_SECRET=${APP_SECRET}
APP_ENV=${APP_ENV:-prod}
CORS_ALLOW_ORIGIN=${CORS_ALLOW_ORIGIN:-'^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'}
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

echo "⏳ Esperando a que MySQL esté listo..."
until php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
    sleep 2
done

echo "✅ MySQL listo. Sincronizando migraciones..."
php bin/console doctrine:migrations:sync-metadata-storage --no-interaction || true
php bin/console doctrine:migrations:version --add --all --no-interaction 2>/dev/null || true
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "🚀 Arrancando Apache..."
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* 2>/dev/null || true
a2enmod mpm_prefork 2>/dev/null || true
exec apache2-foreground
