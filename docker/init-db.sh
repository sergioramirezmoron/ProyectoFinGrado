#!/bin/bash
# Busca el backup más reciente en la carpeta /backups
LATEST=$(ls -t /backups/*.sql 2>/dev/null | head -1)

if [ -n "$LATEST" ]; then
    echo "🔄 Restaurando backup más reciente: $LATEST"
    mysql -u root -proot pfg < "$LATEST"
    echo "✅ Backup restaurado correctamente"
else
    echo "ℹ️  No hay backups disponibles, usando datos del SQL inicial"
fi
