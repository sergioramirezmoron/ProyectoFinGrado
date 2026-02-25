#!/bin/bash
set -e

echo "⚙️  Configurando variables de entorno locales..."
cat > /var/www/html/.env.local << 'ENVEOF'
DATABASE_URL=mysql://pfg_user:pfg_password@db:3306/pfg?serverVersion=8.0&charset=utf8mb4
JWT_PASSPHRASE=mi_secreto_tfg
APP_SECRET=cambia_esto_por_un_secreto_seguro
APP_ENV=prod
ENVEOF

echo "⏳ Esperando a que MySQL esté listo..."
until php bin/console doctrine:query:sql "SELECT 1" > /dev/null 2>&1; do
    sleep 2
done

echo "✅ MySQL listo. Sincronizando migraciones..."
php bin/console doctrine:migrations:sync-metadata-storage --no-interaction || true
php bin/console doctrine:migrations:version --add --all --no-interaction 2>/dev/null || true
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "🚀 Arrancando Apache..."
exec apache2-foreground
