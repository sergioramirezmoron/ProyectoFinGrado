#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="backup_${DATE}.sql"
TMPFILE="/tmp/${FILENAME}"

echo "▶ Iniciando backup: ${FILENAME}"

# Railway inyecta estas variables automáticamente desde el plugin MySQL
mysqldump \
  -h "${MYSQLHOST}" \
  -P "${MYSQLPORT:-3306}" \
  -u "${MYSQLUSER}" \
  -p"${MYSQLPASSWORD}" \
  "${MYSQLDATABASE}" \
  > "${TMPFILE}"

echo "✔ Dump generado: ${TMPFILE}"

# Clonar el repo de backups y subir el archivo
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
