# ── Etapa 1: Build (v2) ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (aprovecha cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar fuentes y compilar
COPY . .

# Recibir URL del backend como build arg (inyectada por docker-compose o --build-arg)
ARG VITE_API_URL
ARG VITE_BACKEND_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build

# ── Etapa 2: Servir con Nginx ──────────────────────────────────────────────────
FROM nginx:alpine

# URLs inyectadas en build-time para CSP y proxy de imágenes
ARG VITE_API_URL=""
ARG NGINX_BACKEND_URL="https://proyectofingrado-production.up.railway.app"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /tmp/nginx.conf.template

# Sustituir sólo las variables propias; las variables de nginx ($uri, $remote_addr…) quedan intactas
RUN VITE_API_URL="${VITE_API_URL}" \
    NGINX_BACKEND_URL="${NGINX_BACKEND_URL}" \
    envsubst '${VITE_API_URL}${NGINX_BACKEND_URL}' \
      < /tmp/nginx.conf.template \
      > /etc/nginx/conf.d/default.conf

EXPOSE 80
