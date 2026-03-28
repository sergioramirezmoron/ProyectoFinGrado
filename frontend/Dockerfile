# ── Etapa 1: Build (v2) ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (aprovecha cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar fuentes y compilar
COPY . .
RUN npm run build

# ── Etapa 2: Servir con Nginx ──────────────────────────────────────────────────
FROM nginx:alpine

# Copiar el build de Vite al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
