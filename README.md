# Luxury Cars — Plataforma de Compra y Alquiler de Vehículos de Lujo

Aplicación web full-stack para la gestión integral de un concesionario de vehículos de lujo. Permite la compra y el alquiler de vehículos, con sistema de reservas, mensajería cliente-concesionario, panel de administración y autenticación basada en JWT.

---

## Tabla de Contenidos

- [Luxury Cars — Plataforma de Compra y Alquiler de Vehículos de Lujo](#luxury-cars--plataforma-de-compra-y-alquiler-de-vehículos-de-lujo)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Arquitectura general](#arquitectura-general)
  - [Estructura del repositorio](#estructura-del-repositorio)
  - [Stack tecnológico](#stack-tecnológico)
  - [Puesta en marcha con Docker (recomendado)](#puesta-en-marcha-con-docker-recomendado)
    - [Requisitos](#requisitos)
    - [Variables de entorno del compose](#variables-de-entorno-del-compose)
    - [Arrancar el entorno completo](#arrancar-el-entorno-completo)
    - [Servicios y puertos](#servicios-y-puertos)
    - [Usuarios de prueba (cargados automáticamente con `automocion.sql`)](#usuarios-de-prueba-cargados-automáticamente-con-automocionsql)
  - [Puesta en marcha manual](#puesta-en-marcha-manual)
  - [Base de datos](#base-de-datos)
  - [Backups automáticos](#backups-automáticos)
  - [Documentación detallada](#documentación-detallada)

---

## Arquitectura general

```
┌─────────────────────┐        ┌──────────────────────────┐
│   Frontend (React)  │──────▶│   Backend (Symfony API)   │
│   Puerto 3000       │  HTTP  │   Puerto 8000             │
│   Nginx sirve SPA   │        │   Apache + PHP 8.2        │
└─────────────────────┘        └──────────────┬───────────┘
                                               │
                                ┌──────────────▼───────────┐
                                │   MySQL 8.0              │
                                │   Puerto 3306            │
                                └──────────────────────────┘
```

En producción (contenedores), el frontend incluye un **proxy Nginx** que redirige internamente las peticiones `/api/*` al servicio `backend`, evitando problemas de CORS y sin exponer el backend directamente al cliente.

---

## Estructura del repositorio

```
ProyectoFinGrado/
├── backend/              # API REST (Symfony 7.3 + API Platform 4.2)
│   ├── src/
│   ├── config/
│   ├── migrations/
│   ├── Dockerfile
│   └── README.md         # Documentación completa del backend
│
├── frontend/             # SPA (React 19 + TypeScript + Vite)
│   ├── src/
│   ├── Dockerfile        # Multi-stage build (Node → Nginx)
│   ├── nginx.conf        # Configuración Nginx para SPA + proxy API
│   └── README.md         # Documentación completa del frontend
│
├── docker/
│   └── init-db.sh        # Script de inicialización de la BD en Docker
│
├── backups/              # Backups SQL generados automáticamente
├── automocion.sql        # Dump inicial de la base de datos
└── docker-compose.yml    # Orquestación completa del entorno
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | PHP 8.2 · Symfony 7.3 · API Platform 4.2 · Doctrine ORM 3.5 |
| **Frontend** | React 19 · TypeScript 5.9 · Vite 7.2 · Tailwind CSS 4.1 |
| **Base de datos** | MySQL 8.0 |
| **Autenticación** | JWT (LexikJWTAuthenticationBundle) |
| **Servidor web** | Apache (backend) · Nginx (frontend) |
| **Contenerización** | Docker · Docker Compose |

---

## Puesta en marcha con Docker (recomendado)

Esta es la forma más sencilla de levantar el entorno completo sin necesidad de instalar PHP, Node.js ni MySQL en la máquina local.

### Requisitos

- [Docker](https://docs.docker.com/get-docker/) >= 24.0
- [Docker Compose](https://docs.docker.com/compose/) >= 2.20 (incluido en Docker Desktop)

### Variables de entorno del compose

Crea un archivo `.env` en la raíz del proyecto (junto al `docker-compose.yml`) copiando la plantilla incluida:

```bash
cp .env.example .env
```

Edita `.env` y rellena los cinco valores requeridos:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SERVER_URL` | URL pública de la aplicación (sin barra final). Usa `http://localhost` para desarrollo local. | `http://localhost` |
| `APP_SECRET` | Cadena aleatoria de 32+ caracteres para Symfony. Genera una con `openssl rand -hex 32`. | `a4f8c2e1b9d7...` |
| `JWT_PASSPHRASE` | Contraseña usada para cifrar la clave privada JWT. Puede ser cualquier cadena larga. | `mi_clave_jwt_segura` |
| `DB_PASSWORD` | Contraseña del usuario de la base de datos MySQL. | `mi_password_db` |
| `CORS_ALLOW_ORIGIN` | Expresión regular de los orígenes permitidos para CORS. En local no es necesario cambiarla. | `^https?://(localhost\|127\.0\.0\.1)(:[0-9]+)?$` |

**Ejemplo de `.env` completo para desarrollo local:**

```env
SERVER_URL=http://localhost
APP_SECRET=a4f8c2e1b9d7f3a6c5e2b1d8f4a9c3e7b2d6f1a5c8e3b7d4f2a9c6e1b5d3f8a2
JWT_PASSPHRASE=mi_clave_jwt_segura_tfg
DB_PASSWORD=mi_password_db
CORS_ALLOW_ORIGIN=^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$
```

> Estas variables se inyectan automáticamente en todos los servicios Docker (backend, frontend, base de datos). No es necesario tocar ningún `.env` dentro de `backend/` o `frontend/` para el despliegue con Docker.

### Arrancar el entorno completo

```bash
# Desde la raíz del repositorio
docker compose up --build
```

La primera vez el proceso tarda unos minutos porque:
1. Descarga las imágenes base (PHP, Node, Nginx, MySQL).
2. Instala dependencias de Composer y npm.
3. Compila el frontend con Vite.
4. Inicializa la base de datos con `automocion.sql`.

Para ejecutarlo en segundo plano:

```bash
docker compose up --build -d
```

Para detener el entorno:

```bash
docker compose down
```

Para detenerlo eliminando también los volúmenes (borra los datos de la BD):

```bash
docker compose down -v
```

### Servicios y puertos

| Servicio | URL | Descripción |
|---|---|---|
| **Frontend** | http://localhost:3000 | Aplicación React |
| **Backend API** | http://localhost:8000/api | API REST |
| **API Docs** | http://localhost:8000/api/docs | Documentación interactiva OpenAPI |
| **phpMyAdmin** | http://localhost:8080 | Gestión de la base de datos |
| **MySQL** | localhost:3306 | Acceso directo a la BD (usuario: `pfg_user`, contraseña: valor de `DB_PASSWORD` en `.env`) |

> El usuario `root` de MySQL tiene contraseña `root` en el contenedor Docker. phpMyAdmin se conecta como `root` automáticamente. Estas credenciales son solo para desarrollo local; cámbialas antes de cualquier despliegue en producción.

### Usuarios de prueba (cargados automáticamente con `automocion.sql`)

| Email | Contraseña | Rol |
|---|---|---|
| `admin@concesionario.com` | `admin` | Administrador |
| `ventas1@concesionario.com` | `123456` | Responsable de ventas |
| `salma.ruelas@ybarra.es` | `123456` | Usuario cliente |

---

## Puesta en marcha manual

Para ejecutar cada servicio por separado sin Docker, consulta los README específicos:

- **Backend**: [`backend/README.md`](./backend/README.md) — instalación de dependencias PHP, configuración de `.env.local`, generación de claves JWT, migraciones y arranque del servidor Symfony.
- **Frontend**: [`frontend/README.md`](./frontend/README.md) — instalación de dependencias Node, configuración de variables de entorno Vite y arranque del servidor de desarrollo.

---

## Base de datos

El archivo `automocion.sql` contiene el dump completo de la base de datos con datos de ejemplo (marcas, modelos, vehículos, usuarios). En el entorno Docker se carga automáticamente al crear el contenedor de MySQL por primera vez.

En caso de querer recargar los datos desde cero con Docker:

```bash
docker compose down -v        # elimina el volumen de datos
docker compose up --build -d  # recrea y vuelve a importar el SQL
```

Para el entorno manual, también puedes cargar los fixtures incluidos en el backend (borran los datos existentes y generan nuevos datos de ejemplo):

```bash
cd backend
php bin/console doctrine:fixtures:load
```

---

## Backups automáticos

El compose incluye un servicio `backup` que realiza un volcado diario de la base de datos. Los archivos se guardan en el directorio `backups/` con el formato `backup_YYYYMMDD_HHMMSS.sql`. Los backups con más de 7 días se eliminan automáticamente.

Para realizar un backup manual en cualquier momento:

```bash
docker exec pfg_db mysqldump -u root -proot pfg > backups/backup_manual.sql
```

---

## Documentación detallada

| Recurso | Descripción |
|---|---|
| [`backend/README.md`](./backend/README.md) | Instalación manual, variables de entorno, autenticación JWT, roles, endpoints REST con ejemplos, filtros, lógica de negocio, seguridad (login throttling), optimizaciones de rendimiento y suite de 47 tests PHPUnit |
| [`frontend/README.md`](./frontend/README.md) | Instalación manual, arquitectura MVC, rutas por rol, módulos principales (auth, chat, reservas), navegación por rol en la cabecera, suite de 264 tests Vitest, despliegue y troubleshooting |
| `http://localhost:8000/api/docs` | Documentación interactiva OpenAPI generada automáticamente por API Platform (disponible con el entorno levantado) |

---

Desarrollado por **Sergio Ramírez Morón** — Proyecto de Fin de Grado.
