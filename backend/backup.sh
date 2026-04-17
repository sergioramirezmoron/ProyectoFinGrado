#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="backup_${DATE}.sql"
TMPFILE="/tmp/${FILENAME}"

echo "▶ Iniciando backup: ${FILENAME}"

# Parsear DATABASE_URL: mysql://user:password@host:port/database?params
DB_USER=$(echo "$DATABASE_URL" | sed 's|mysql://\([^:]*\):.*|\1|')
DB_PASS=$(echo "$DATABASE_URL" | sed 's|mysql://[^:]*:\([^@]*\)@.*|\1|')
DB_HOST=$(echo "$DATABASE_URL" | sed 's|mysql://[^@]*@\([^:/]*\).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed 's|mysql://[^@]*@[^:]*:\([0-9]*\)/.*|\1|')
DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/\([^?]*\).*|\1|')

mysqldump \
  -h "${DB_HOST}" \
  -P "${DB_PORT:-3306}" \
  -u "${DB_USER}" \
  -p"${DB_PASS}" \
  "${DB_NAME}" \
  > "${TMPFILE}"

echo "✔ Dump generado"

# Subir a GitHub
cd /tmp
git config --global user.email "backup@railway"
git config --global user.name "Railway Backup"

git clone "https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git" backup-repo 2>/dev/null
cp "${TMPFILE}" backup-repo/
cd backup-repo
git add "${FILENAME}"
git commit -m "backup: ${DATE}"
git push

echo "✔ Backup subido a GitHub: ${FILENAME}"
