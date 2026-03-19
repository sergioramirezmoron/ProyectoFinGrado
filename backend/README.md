# Backend — Luxury Cars API

API REST desarrollada con **Symfony 7.3** y **API Platform 4.2** para la plataforma de compra y alquiler de vehículos de lujo.

---

## Tabla de Contenidos

- [Requisitos previos](#requisitos-previos)
- [Instalación y configuración](#instalación-y-configuración)
    - [1. Clonar e instalar dependencias](#1-clonar-e-instalar-dependencias)
    - [2. Configurar el archivo .env](#2-configurar-el-archivo-env)
    - [3. Generar las claves JWT](#3-generar-las-claves-jwt)
    - [4. Crear la base de datos y ejecutar migraciones](#4-crear-la-base-de-datos-y-ejecutar-migraciones)
    - [5. Cargar datos de prueba (opcional)](#5-cargar-datos-de-prueba-opcional)
    - [6. Arrancar el servidor](#6-arrancar-el-servidor)
- [Variables de entorno (.env)](#variables-de-entorno-env)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Autenticación JWT](#autenticación-jwt)
- [Roles de usuario](#roles-de-usuario)
- [Formato de respuestas](#formato-de-respuestas)
- [Códigos de estado HTTP](#códigos-de-estado-http)
- [Endpoints](#endpoints)
    - [Auth — Login](#auth--login)
    - [Usuarios](#usuarios)
    - [Vehículos](#vehículos)
    - [Imágenes de vehículos](#imágenes-de-vehículos)
    - [Reservas](#reservas)
    - [Conversaciones](#conversaciones)
    - [Mensajes](#mensajes)
    - [Favoritos](#favoritos)
    - [Marcas](#marcas)
    - [Modelos](#modelos)
    - [Colores](#colores)
    - [Combustibles](#combustibles)
    - [Transmisiones](#transmisiones)
    - [Tipos de carrocería](#tipos-de-carrocería)
    - [Distintivos ambientales](#distintivos-ambientales)
    - [Provincias](#provincias)
    - [Estadísticas del panel](#estadísticas-del-panel)
- [Filtros y paginación](#filtros-y-paginación)
- [Lógica de negocio importante](#lógica-de-negocio-importante)
- [Manejo de errores](#manejo-de-errores)

---

## Requisitos previos

| Herramienta | Versión mínima | Notas                                                    |
| ----------- | -------------- | -------------------------------------------------------- |
| PHP         | 8.2            | Con extensiones `ctype`, `iconv`, `openssl`, `pdo_mysql` |
| Composer    | 2.x            | Gestor de dependencias PHP                               |
| MySQL       | 8.0            | O MariaDB 10.11+                                         |
| Symfony CLI | Última         | Para el servidor de desarrollo                           |
| OpenSSL     | Cualquiera     | Para generar las claves JWT                              |

> Si no tienes Symfony CLI instalado: https://symfony.com/download

---

## Instalación y configuración

### 1. Clonar e instalar dependencias

```bash
cd backend
composer install
```

### 2. Configurar el archivo .env

Copia el archivo `.env` y crea un `.env.local` con tus valores reales (el `.env.local` nunca se sube a git):

```bash
cp .env .env.local
```

Edita `.env.local` con tus datos. Consulta la sección [Variables de entorno](#variables-de-entorno-env) para ver qué significa cada una.

**Ejemplo de `.env.local` mínimo para desarrollo:**

```dotenv
APP_ENV=dev
APP_SECRET=cambia_esto_por_una_cadena_aleatoria_larga

DATABASE_URL="mysql://usuario:contraseña@127.0.0.1:3306/luxury_cars?serverVersion=8.0.32&charset=utf8mb4"

CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=tu_passphrase_segura
```

### 3. Generar las claves JWT

Las claves JWT son necesarias para que el sistema de autenticación funcione. Ejecuta:

```bash
php bin/console lexik:jwt:generate-keypair
```

Esto crea automáticamente:

- `config/jwt/private.pem` — clave privada (nunca la subas a git)
- `config/jwt/public.pem` — clave pública

> Si el directorio `config/jwt/` no existe, créalo primero: `mkdir -p config/jwt`

Si prefieres generarlas manualmente con OpenSSL:

```bash
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout
```

Usa la misma `JWT_PASSPHRASE` que pusiste en `.env.local`.

### 4. Crear la base de datos y ejecutar migraciones

```bash
# Crear la base de datos
php bin/console doctrine:database:create

# Ejecutar todas las migraciones
php bin/console doctrine:migrations:migrate
```

Si quieres empezar desde cero en desarrollo (elimina y recrea todo):

```bash
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

### 5. Cargar datos de prueba (opcional)

El proyecto incluye fixtures con datos de ejemplo (marcas, modelos, vehículos, usuarios de prueba):

```bash
php bin/console doctrine:fixtures:load
```

> **Atención:** esto borra todos los datos existentes. Solo úsalo en desarrollo.

Tras cargar los fixtures tendrás, entre otros:

- Un usuario administrador de prueba (revisa `src/DataFixtures/AppFixtures.php` para ver las credenciales)

### 6. Arrancar el servidor

Con Symfony CLI (recomendado):

```bash
symfony server:start
```

O con el servidor integrado de PHP:

```bash
php -S localhost:8000 -t public/
```

La API quedará disponible en: `http://localhost:8000/api`

La documentación interactiva de OpenAPI en: `http://localhost:8000/api/docs`

---

## Variables de entorno (.env)

| Variable                  | Descripción                                                                                                         | Valor por defecto                                  | Obligatoria |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------- |
| `APP_ENV`                 | Entorno de ejecución. Usa `dev` en local y `prod` en producción.                                                    | `dev`                                              | Sí          |
| `APP_SECRET`              | Cadena aleatoria usada para firmar tokens CSRF y cookies. Debe ser única y secreta.                                 | vacío                                              | Sí          |
| `DATABASE_URL`            | Cadena de conexión completa a la base de datos. Cambia `usuario`, `contraseña`, `host` y `nombre_bd` por los tuyos. | `mysql://app:!ChangeMe!@127.0.0.1:3306/app`        | Sí          |
| `CORS_ALLOW_ORIGIN`       | Expresión regular de los orígenes permitidos para CORS. En producción, cambia `localhost` por tu dominio real.      | `'^https?://(localhost\|127\.0\.0\.1)(:[0-9]+)?$'` | Sí          |
| `JWT_SECRET_KEY`          | Ruta a la clave privada PEM para firmar tokens JWT. No cambiar si usaste el comando `lexik:jwt:generate-keypair`.   | `%kernel.project_dir%/config/jwt/private.pem`      | Sí          |
| `JWT_PUBLIC_KEY`          | Ruta a la clave pública PEM para verificar tokens JWT.                                                              | `%kernel.project_dir%/config/jwt/public.pem`       | Sí          |
| `JWT_PASSPHRASE`          | Contraseña con la que se cifró la clave privada JWT. Debe coincidir con la usada al generarla.                      | `!ChangeMe!`                                       | Sí          |
| `DEFAULT_URI`             | URI base para generar URLs en contextos no-HTTP (comandos de consola).                                              | `http://localhost`                                 | No          |
| `MESSENGER_TRANSPORT_DSN` | DSN del transporte para Symfony Messenger. Con `doctrine://default` usa la propia BD.                               | `doctrine://default?auto_setup=0`                  | No          |
| `MAILER_DSN`              | DSN del servidor de correo. `null://null` desactiva el envío real.                                                  | `null://null`                                      | No          |

**Ejemplo completo de `.env.local` para producción:**

```dotenv
APP_ENV=prod
APP_SECRET=a4f8c2e1b9d7f3a6c5e2b1d8f4a9c3e7b2d6f1a5c8e3b7d4f2a9c6e1b5d3f8a2

DATABASE_URL="mysql://luxury_user:SuperPassword123@127.0.0.1:3306/luxury_cars_prod?serverVersion=8.0.32&charset=utf8mb4"

CORS_ALLOW_ORIGIN='^https?://(tudominio\.com)(:[0-9]+)?$'

JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=OtraContraseñaMuySegura456
```

---

## Estructura del proyecto

```
backend/
├── config/
│   ├── jwt/                  # Claves privada y pública JWT (no subir a git)
│   └── packages/
│       ├── security.yaml     # Configuración de firewalls y control de acceso
│       └── ...
├── public/
│   └── images/
│       └── vehicles/         # Imágenes subidas de los vehículos
├── src/
│   ├── Controller/           # Controladores personalizados (stats, upload de imágenes)
│   ├── DataFixtures/         # Datos de prueba
│   ├── Doctrine/             # Extensiones de consulta (filtros automáticos)
│   ├── Entity/               # Entidades Doctrine (también definen la API con atributos)
│   ├── EventListener/        # Listeners de eventos (ej: crear conversación al reservar)
│   ├── Repository/           # Repositorios con queries personalizadas
│   ├── Security/             # Autenticador JWT personalizado
│   ├── State/                # Procesadores de estado (ej: hash de contraseñas)
│   └── Validator/            # Validadores personalizados (ej: reservas solapadas)
└── migrations/               # Migraciones de base de datos
```

---

## Autenticación JWT

El sistema usa **JSON Web Tokens (JWT)** para autenticar todas las peticiones protegidas.

### Flujo de autenticación

1. El cliente hace `POST /api/login_check` con email y contraseña
2. El servidor devuelve un token JWT
3. El cliente incluye el token en todas las peticiones como header `Authorization: Bearer {token}`

### Payload del token

El token JWT contiene los siguientes datos decodificados:

```json
{
    "iat": 1742000000,
    "exp": 1742086400,
    "username": "usuario@example.com",
    "roles": ["ROLE_USER"],
    "id": 3,
    "name": "Juan",
    "phone": "666777888"
}
```

El token expira en **24 horas** por defecto (configurable en `config/packages/lexik_jwt_authentication.yaml`).

---

## Roles de usuario

| Rol          | Descripción                                                  | Permisos principales                                                                              |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `ROLE_USER`  | Usuario registrado (asignado automáticamente al registrarse) | Crear y cancelar sus propias reservas, enviar mensajes, gestionar favoritos, actualizar su perfil |
| `ROLE_SALES` | Responsable de ventas                                        | Todo lo de `ROLE_USER` + crear/editar vehículos, ver todas las conversaciones y reservas          |
| `ROLE_ADMIN` | Administrador total                                          | Acceso completo: usuarios, vehículos, reservas, conversaciones, catálogos                         |

> En el `AuthContext` del frontend, `isAdmin` es `true` tanto para `ROLE_ADMIN` como para `ROLE_SALES`, lo que les da acceso al panel de administración.

---

## Formato de respuestas

La API usa el formato **JSON-LD + Hydra**. Las colecciones siempre devuelven:

```json
{
    "@context": "/api/contexts/Vehicle",
    "@id": "/api/vehicles",
    "@type": "hydra:Collection",
    "hydra:member": [ ... ],
    "hydra:totalItems": 150,
    "hydra:view": {
        "@id": "/api/vehicles?page=1",
        "@type": "hydra:PartialCollectionView",
        "hydra:first": "/api/vehicles?page=1",
        "hydra:last": "/api/vehicles?page=8",
        "hydra:next": "/api/vehicles?page=2"
    }
}
```

Los recursos individuales incluyen `@id` (IRI) y `@type`. Las relaciones entre recursos se expresan como IRIs: `"/api/vehicles/425"`.

---

## Códigos de estado HTTP

| Código | Significado           | Cuándo ocurre                                                     |
| ------ | --------------------- | ----------------------------------------------------------------- |
| `200`  | OK                    | GET o PATCH exitoso                                               |
| `201`  | Created               | POST exitoso (recurso creado)                                     |
| `204`  | No Content            | DELETE exitoso                                                    |
| `400`  | Bad Request           | JSON malformado o archivo no enviado                              |
| `401`  | Unauthorized          | Token JWT ausente, inválido o expirado                            |
| `403`  | Forbidden             | Token válido pero sin permisos para esa operación                 |
| `404`  | Not Found             | El recurso solicitado no existe                                   |
| `422`  | Unprocessable Entity  | Errores de validación (fechas incorrectas, email duplicado, etc.) |
| `500`  | Internal Server Error | Error inesperado del servidor                                     |

---

## Endpoints

> **Base URL:** `http://localhost:8000/api`
>
> Todos los endpoints que requieren autenticación necesitan el header:
>
> ```
> Authorization: Bearer {tu_token_jwt}
> ```
>
> Todos los PATCH necesitan además:
>
> ```
> Content-Type: application/merge-patch+json
> ```

---

## Auth — Login

### POST /api/login_check

Genera un token JWT a partir de email y contraseña.

**Autenticación:** No requerida

**Request Body:**

```json
{
    "email": "admin@example.com",
    "password": "admin123"
}
```

**Response 200 OK:**

```json
{
    "token": "eyJhbGciOiJSUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJpYXQiOjE3NDIwMDAwMDAsImV4cCI6MTc0MjA4NjQwMH0..."
}
```

**Response 401 Unauthorized:**

```json
{
    "code": 401,
    "message": "Invalid credentials."
}
```

---

## Usuarios

### GET /api/users

Lista todos los usuarios del sistema.

**Autenticación:** Requerida (Admin)

**Response 200 OK:**

```json
{
    "hydra:member": [
        {
            "id": 1,
            "email": "admin@example.com",
            "roles": ["ROLE_USER", "ROLE_ADMIN"],
            "name": "Admin",
            "surname": "Principal",
            "phone": "666000001",
            "province": "/api/provinces/1"
        }
    ],
    "hydra:totalItems": 50
}
```

---

### GET /api/users/{id}

Obtiene un usuario por su ID.

**Autenticación:** Requerida

**Response 200 OK:**

```json
{
    "id": 3,
    "email": "juan@example.com",
    "roles": ["ROLE_USER"],
    "name": "Juan",
    "surname": "Pérez",
    "phone": "666777888",
    "province": "/api/provinces/8"
}
```

---

### POST /api/users

Registra un nuevo usuario. El rol `ROLE_USER` se asigna automáticamente.

**Autenticación:** No requerida (registro público)

**Request Body:**

```json
{
    "email": "nuevo@example.com",
    "plainPassword": "miPassword123",
    "name": "María",
    "surname": "García",
    "phone": "666111222",
    "province": "/api/provinces/8"
}
```

| Campo           | Tipo   | Obligatorio      | Validación                                |
| --------------- | ------ | ---------------- | ----------------------------------------- |
| `email`         | string | Sí               | Formato email válido, único en el sistema |
| `plainPassword` | string | Sí (en creación) | Mínimo 6 caracteres                       |
| `name`          | string | Sí               | No vacío                                  |
| `surname`       | string | No               | —                                         |
| `phone`         | string | No               | Máximo 20 caracteres                      |
| `province`      | IRI    | No               | IRI de una provincia existente            |

**Response 201 Created:**

```json
{
    "id": 52,
    "email": "nuevo@example.com",
    "roles": ["ROLE_USER"],
    "name": "María",
    "surname": "García"
}
```

---

### PATCH /api/users/{id}

Actualiza campos concretos de un usuario.

**Autenticación:** Requerida

**Headers:**

```
Content-Type: application/merge-patch+json
```

**Request Body** (solo los campos a modificar):

```json
{
    "name": "María Actualizada",
    "phone": "666999888"
}
```

Para cambiar contraseña, usa `plainPassword`:

```json
{
    "plainPassword": "nuevaContraseña456"
}
```

Para cambiar roles (solo Admin):

```json
{
    "roles": ["ROLE_USER", "ROLE_SALES"]
}
```

**Response 200 OK:** devuelve el usuario actualizado.

---

### DELETE /api/users/{id}

Elimina un usuario.

**Autenticación:** Requerida (Admin)

**Response:** `204 No Content`

---

## Vehículos

### GET /api/vehicles

Lista vehículos con filtros, ordenación y paginación.

**Autenticación:** No requerida

**Parámetros de consulta:**

| Parámetro           | Tipo    | Descripción                           | Ejemplo                  |
| ------------------- | ------- | ------------------------------------- | ------------------------ |
| `page`              | integer | Página (20 resultados por página)     | `?page=2`                |
| `type`              | string  | `SALE` o `RENT`                       | `?type=RENT`             |
| `status`            | string  | `AVAILABLE`, `SOLD`, `RESERVED`       | `?status=AVAILABLE`      |
| `brand`             | integer | ID de la marca                        | `?brand=5`               |
| `model`             | integer | ID del modelo                         | `?model=12`              |
| `fuelType`          | integer | ID del combustible                    | `?fuelType=39`           |
| `transmission`      | integer | ID de la transmisión                  | `?transmission=1`        |
| `bodyType`          | integer | ID del tipo de carrocería             | `?bodyType=2`            |
| `color`             | integer | ID del color                          | `?color=3`               |
| `enviromentalBadge` | integer | ID del distintivo ambiental           | `?enviromentalBadge=2`   |
| `province`          | integer | ID de la provincia                    | `?province=8`            |
| `price[gte]`        | decimal | Precio mínimo                         | `?price[gte]=20000`      |
| `price[lte]`        | decimal | Precio máximo                         | `?price[lte]=50000`      |
| `dailyPrice[gte]`   | decimal | Precio diario mínimo                  | `?dailyPrice[gte]=30`    |
| `dailyPrice[lte]`   | decimal | Precio diario máximo                  | `?dailyPrice[lte]=100`   |
| `year[gte]`         | integer | Año mínimo                            | `?year[gte]=2020`        |
| `year[lte]`         | integer | Año máximo                            | `?year[lte]=2024`        |
| `kilometres[lte]`   | integer | Kilómetros máximos                    | `?kilometres[lte]=50000` |
| `power[gte]`        | integer | Potencia mínima (CV)                  | `?power[gte]=150`        |
| `brand.name`        | string  | Búsqueda parcial por nombre de marca  | `?brand.name=Toyota`     |
| `model.name`        | string  | Búsqueda parcial por nombre de modelo | `?model.name=Corolla`    |
| `order[price]`      | string  | Ordenar por precio (`asc`/`desc`)     | `?order[price]=asc`      |
| `order[dailyPrice]` | string  | Ordenar por precio diario             | `?order[dailyPrice]=asc` |
| `order[year]`       | string  | Ordenar por año                       | `?order[year]=desc`      |
| `order[kilometres]` | string  | Ordenar por kilómetros                | `?order[kilometres]=asc` |
| `order[createdAt]`  | string  | Ordenar por fecha de creación         | `?order[createdAt]=desc` |

> Los vehículos con `status=DELETED` están **siempre ocultos** automáticamente (extensión `HideDeletedVehiclesExtension`).

**Ejemplo con múltiples filtros:**

```
GET /api/vehicles?type=SALE&status=AVAILABLE&fuelType=39&price[gte]=20000&price[lte]=60000&year[gte]=2019&order[price]=asc&page=1
```

**Response 200 OK:**

```json
{
    "hydra:member": [
        {
            "id": 427,
            "brand": { "name": "Toyota" },
            "model": { "name": "Yaris" },
            "price": "32599",
            "dailyPrice": null,
            "year": 2023,
            "kilometres": 15000,
            "power": 100,
            "displacement": 1000,
            "fuelType": { "id": 39, "name": "Gasolina" },
            "transmission": { "name": "Automático" },
            "bodyType": { "name": "Compacto" },
            "enviromentalBadge": {
                "name": "ECO",
                "imageUrl": "/images/enviromentalBadges/eco.png"
            },
            "color": { "name": "Rojo", "hexCode": "#FE0000" },
            "doors": 5,
            "owners": 1,
            "description": "Vehículo en excelente estado...",
            "status": "AVAILABLE",
            "type": "SALE",
            "visible": true,
            "province": { "name": "Madrid" },
            "vehicleImages": [
                {
                    "id": 183,
                    "filename": "69a2d3398afc7.jpg",
                    "main": true,
                    "imageUrl": "/images/vehicles/69a2d3398afc7.jpg"
                }
            ],
            "createdAt": "2026-02-28T12:36:25+01:00",
            "updatedAt": null
        }
    ],
    "hydra:totalItems": 120
}
```

---

### GET /api/vehicles/{id}

Obtiene un vehículo por su ID.

**Autenticación:** No requerida

**Response 200 OK:** misma estructura que un elemento de la colección anterior.

---

### POST /api/vehicles

Crea un nuevo vehículo.

**Autenticación:** Requerida (`ROLE_ADMIN` o `ROLE_SALES`)

**Request Body:**

```json
{
    "brand": "/api/brands/1",
    "model": "/api/models/5",
    "type": "SALE",
    "status": "AVAILABLE",
    "price": "35000",
    "dailyPrice": null,
    "year": 2023,
    "kilometres": 15000,
    "power": 150,
    "displacement": 2000,
    "fuelType": "/api/fuels/39",
    "transmission": "/api/transmissions/1",
    "bodyType": "/api/body_types/2",
    "enviromentalBadge": "/api/enviromental_badges/3",
    "color": "/api/colors/1",
    "doors": 5,
    "owners": 1,
    "description": "Vehículo seminuevo en perfecto estado",
    "visible": true,
    "province": "/api/provinces/8"
}
```

| Campo               | Tipo    | Obligatorio | Validación                                  |
| ------------------- | ------- | ----------- | ------------------------------------------- |
| `brand`             | IRI     | Sí          | IRI de marca existente                      |
| `model`             | IRI     | Sí          | IRI de modelo existente                     |
| `type`              | string  | Sí          | `SALE` o `RENT`                             |
| `status`            | string  | Sí          | `AVAILABLE`, `SOLD`, `RESERVED` o `DELETED` |
| `price`             | decimal | No          | ≥ 0. Usar para `type=SALE`                  |
| `dailyPrice`        | decimal | No          | ≥ 0. Usar para `type=RENT`                  |
| `year`              | integer | Sí          | > 1900                                      |
| `kilometres`        | integer | Sí          | ≥ 0                                         |
| `power`             | integer | Sí          | > 0                                         |
| `displacement`      | integer | No          | > 0                                         |
| `fuelType`          | IRI     | Sí          | IRI de combustible existente                |
| `transmission`      | IRI     | Sí          | IRI de transmisión existente                |
| `bodyType`          | IRI     | No          | IRI de carrocería existente                 |
| `enviromentalBadge` | IRI     | No          | IRI de distintivo existente                 |
| `color`             | IRI     | No          | IRI de color existente                      |
| `doors`             | integer | No          | 0–10                                        |
| `owners`            | integer | Sí          | ≥ 0                                         |
| `province`          | IRI     | No          | IRI de provincia existente                  |
| `visible`           | boolean | No          | `true` por defecto                          |

**Response 201 Created:** devuelve el vehículo completo creado.

---

### PUT /api/vehicles/{id}

Reemplaza completamente un vehículo (todos los campos requeridos).

**Autenticación:** Requerida (`ROLE_ADMIN` o `ROLE_SALES`)

**Request Body:** mismo formato que POST con todos los campos.

---

### PATCH /api/vehicles/{id}

Actualiza campos concretos de un vehículo.

**Autenticación:** Requerida (`ROLE_ADMIN` o `ROLE_SALES`)

**Headers:**

```
Content-Type: application/merge-patch+json
```

**Request Body** (solo los campos a modificar):

```json
{
    "price": "33000",
    "status": "SOLD"
}
```

---

### DELETE /api/vehicles/{id}

Elimina un vehículo permanentemente de la base de datos.

**Autenticación:** Requerida (`ROLE_ADMIN`)

> En la práctica, es preferible cambiar el `status` a `DELETED` mediante PATCH para no perder el historial.

**Response:** `204 No Content`

---

## Imágenes de vehículos

### POST /api/vehicle_images

Sube una nueva imagen para un vehículo. El endpoint usa `multipart/form-data`.

**Autenticación:** Requerida

**Content-Type:** `multipart/form-data`

**Campos del formulario:**

| Campo  | Tipo   | Descripción                                  |
| ------ | ------ | -------------------------------------------- |
| `file` | File   | El archivo de imagen (JPG, PNG, WebP…)       |
| `main` | string | `"1"` si es la imagen principal, `"0"` si no |

**Ejemplo con curl:**

```bash
curl -X POST http://localhost:8000/api/vehicle_images \
  -H "Authorization: Bearer {token}" \
  -F "file=@/ruta/imagen.jpg" \
  -F "main=1"
```

**Response 201 Created:**

```json
{
    "id": 184,
    "filename": "6a3b4c5d6e7f8.jpg",
    "main": true,
    "imageUrl": "/images/vehicles/6a3b4c5d6e7f8.jpg"
}
```

> Las imágenes se guardan en `public/images/vehicles/`. La URL de acceso público es `{BACKEND_URL}/images/vehicles/{filename}`.

---

### PATCH /api/vehicle_images/{id}

Actualiza los metadatos de una imagen (por ejemplo, cambiar cuál es la principal).

**Autenticación:** Requerida

**Headers:**

```
Content-Type: application/merge-patch+json
```

**Request Body:**

```json
{
    "vehicle": "/api/vehicles/427",
    "main": true
}
```

---

### DELETE /api/vehicle_images/{id}

Elimina una imagen de vehículo.

**Autenticación:** Requerida

**Response:** `204 No Content`

---

## Reservas

### GET /api/reservations

Lista reservas. Ordenadas por `id DESC` (la más reciente primero).

**Autenticación:** Requerida

**Parámetros de consulta:**

| Parámetro    | Descripción                | Ejemplo             |
| ------------ | -------------------------- | ------------------- |
| `vehicle.id` | Filtrar por ID de vehículo | `?vehicle.id=425`   |
| `status`     | Filtrar por estado         | `?status=CONFIRMED` |
| `user.id`    | Filtrar por ID de usuario  | `?user.id=3`        |

**Estados posibles:**

| Estado      | Descripción                                              |
| ----------- | -------------------------------------------------------- |
| `PENDING`   | Creada por el usuario, esperando confirmación del admin  |
| `CONFIRMED` | Confirmada por el admin. Bloquea las fechas del vehículo |
| `REJECTED`  | Rechazada por el admin                                   |
| `CANCELLED` | Cancelada por el usuario. Libera las fechas              |

**Response 200 OK:**

```json
{
    "hydra:member": [
        {
            "id": 16,
            "startDate": "2026-05-10T00:00:00+02:00",
            "endDate": "2026-05-15T00:00:00+02:00",
            "status": "CONFIRMED",
            "totalPrice": 105.0,
            "vehicle": {
                "id": 425,
                "brand": { "name": "Audi" },
                "model": { "name": "A4" },
                "vehicleImages": [
                    { "imageUrl": "/images/vehicles/abc.jpg", "main": true }
                ],
                "dailyPrice": "21.00",
                "type": "RENT",
                "status": "AVAILABLE"
            },
            "user": {
                "id": 3,
                "email": "juan@example.com",
                "name": "Juan",
                "surname": "Pérez"
            }
        }
    ],
    "hydra:totalItems": 8
}
```

---

### GET /api/reservations/{id}

Obtiene una reserva por su ID.

**Autenticación:** Requerida

**Response 200 OK:** misma estructura que un elemento de la colección.

---

### POST /api/reservations

Crea una nueva reserva. El `totalPrice` se calcula automáticamente (`dailyPrice × días`). Al crearse, se genera automáticamente una **conversación** con un mensaje inicial al admin.

**Autenticación:** Requerida

**Request Body:**

```json
{
    "startDate": "2026-05-10",
    "endDate": "2026-05-15",
    "vehicle": "/api/vehicles/425",
    "user": "/api/users/3",
    "status": "PENDING"
}
```

| Campo       | Tipo              | Obligatorio | Validación                                                    |
| ----------- | ----------------- | ----------- | ------------------------------------------------------------- |
| `startDate` | date `YYYY-MM-DD` | Sí          | Debe ser una fecha futura (> hoy)                             |
| `endDate`   | date `YYYY-MM-DD` | Sí          | Debe ser posterior a `startDate`. No puede ser anterior a hoy |
| `vehicle`   | IRI               | Sí          | IRI de un vehículo de tipo `RENT` existente                   |
| `user`      | IRI               | Sí          | IRI del usuario que hace la reserva                           |
| `status`    | string            | Sí          | Siempre enviar `"PENDING"` al crear                           |

**Validaciones de negocio:**

- Las fechas no pueden solaparse con otras reservas en estado `CONFIRMED` del mismo vehículo
- Las reservas `REJECTED`, `PENDING` y `CANCELLED` existentes **no** bloquean las fechas

**Response 201 Created:**

```json
{
    "id": 17,
    "startDate": "2026-05-10T00:00:00+02:00",
    "endDate": "2026-05-15T00:00:00+02:00",
    "status": "PENDING",
    "totalPrice": 105.0,
    "vehicle": { "id": 425 },
    "user": { "id": 3 }
}
```

**Response 422 — Fechas en el pasado:**

```json
{
    "violations": [
        {
            "propertyPath": "startDate",
            "message": "La fecha de inicio debe ser futura"
        }
    ]
}
```

**Response 422 — Solapamiento de fechas:**

```json
{
    "@type": "ConstraintViolationList",
    "hydra:description": "El vehículo ya está reservado en estas fechas (del 10/05/2026 al 15/05/2026)."
}
```

---

### PATCH /api/reservations/{id}

Cambia el estado de una reserva. Usado por admins para confirmar/rechazar y por usuarios para cancelar.

**Autenticación:** Requerida

**Headers:**

```
Content-Type: application/merge-patch+json
```

**Request Body:**

```json
{
    "status": "CONFIRMED"
}
```

**Transiciones de estado permitidas:**

| Desde       | Hacia       | Quién                     |
| ----------- | ----------- | ------------------------- |
| `PENDING`   | `CONFIRMED` | Admin / Sales             |
| `PENDING`   | `REJECTED`  | Admin / Sales             |
| `PENDING`   | `CANCELLED` | El propio usuario o Admin |
| `CONFIRMED` | `CANCELLED` | El propio usuario o Admin |

> No se puede modificar una reserva cuya `endDate` ya pasó (validación de backend).

---

### DELETE /api/reservations/{id}

Elimina una reserva permanentemente.

**Autenticación:** Requerida

**Response:** `204 No Content`

---

## Conversaciones

Las conversaciones se crean automáticamente al hacer una reserva. También se pueden crear manualmente desde el formulario de contacto del frontend.

### GET /api/conversations

Lista todas las conversaciones. Ordenadas por `updatedAt DESC` (las más recientes primero).

**Autenticación:** Requerida (`IS_AUTHENTICATED_FULLY`)

**Parámetros de consulta:**

| Parámetro      | Descripción                    | Ejemplo                          |
| -------------- | ------------------------------ | -------------------------------- |
| `status`       | Filtrar por estado             | `?status=NEW`                    |
| `contactEmail` | Filtrar por email del contacto | `?contactEmail=juan@example.com` |

**Estados posibles:** `NEW`, `READ`, `ARCHIVED`

**Response 200 OK:**

```json
{
    "hydra:member": [
        {
            "id": 12,
            "contactName": "Juan Pérez",
            "contactEmail": "juan@example.com",
            "contactPhone": "666777888",
            "status": "NEW",
            "vehicle": {
                "brand": { "name": "Audi" },
                "model": { "name": "A4" },
                "status": "AVAILABLE",
                "vehicleImages": [
                    { "imageUrl": "/images/vehicles/abc.jpg", "main": true }
                ]
            },
            "messages": [
                {
                    "id": 45,
                    "content": "🚀 NUEVA SOLICITUD DE RESERVA\n\n📅 Fechas: 10/05/2026 al 15/05/2026\n💰 Total: 105€",
                    "createdAt": "2026-03-15T10:30:00+01:00",
                    "isAdmin": false
                }
            ],
            "reservation": {
                "id": 16,
                "startDate": "2026-05-10T00:00:00+02:00",
                "endDate": "2026-05-15T00:00:00+02:00",
                "status": "PENDING",
                "totalPrice": 105.0
            },
            "user": "/api/users/3",
            "createdAt": "2026-03-15T10:30:00+01:00",
            "updatedAt": "2026-03-15T10:30:00+01:00"
        }
    ],
    "hydra:totalItems": 8
}
```

---

### GET /api/conversations/{id}

Obtiene el detalle de una conversación con todos sus mensajes.

**Autenticación:** Requerida (`IS_AUTHENTICATED_FULLY`)

**Response 200 OK:** misma estructura que un elemento de la colección, con todos los mensajes completos.

---

### POST /api/conversations

Crea una conversación (formulario de contacto del frontend).

**Autenticación:** Pública (`PUBLIC_ACCESS`)

**Request Body:**

```json
{
    "contactName": "María García",
    "contactEmail": "maria@example.com",
    "contactPhone": "666111222",
    "vehicle": "/api/vehicles/425",
    "status": "NEW",
    "user": "/api/users/5"
}
```

| Campo          | Obligatorio | Descripción                           |
| -------------- | ----------- | ------------------------------------- |
| `contactName`  | Sí          | Nombre del contacto                   |
| `contactEmail` | Sí          | Email del contacto                    |
| `contactPhone` | No          | Teléfono de contacto                  |
| `vehicle`      | Sí          | IRI del vehículo al que se refiere    |
| `status`       | No          | Por defecto `"NEW"`                   |
| `user`         | No          | IRI del usuario autenticado si existe |

**Response 201 Created:** devuelve la conversación creada.

---

### PATCH /api/conversations/{id}

Actualiza el estado de una conversación (marcar como leída, archivar, etc.).

**Autenticación:** Requerida. Solo el admin, el usuario propietario o quien tenga el mismo email que `contactEmail`.

**Headers:**

```
Content-Type: application/merge-patch+json
```

**Request Body:**

```json
{
    "status": "READ"
}
```

---

## Mensajes

### POST /api/messages

Envía un mensaje dentro de una conversación existente.

**Autenticación:** Requerida

**Request Body:**

```json
{
    "content": "Hola, me interesa reservar este vehículo para esas fechas.",
    "isAdmin": false,
    "conversation": "/api/conversations/12"
}
```

| Campo          | Obligatorio | Descripción                                                       |
| -------------- | ----------- | ----------------------------------------------------------------- |
| `content`      | Sí          | Texto del mensaje                                                 |
| `isAdmin`      | Sí          | `true` si lo envía un admin/sales, `false` si lo envía un cliente |
| `conversation` | Sí          | IRI de la conversación a la que pertenece                         |

**Response 201 Created:**

```json
{
    "id": 47,
    "content": "Hola, me interesa reservar este vehículo para esas fechas.",
    "createdAt": "2026-03-19T15:30:00+01:00",
    "isAdmin": false,
    "conversation": "/api/conversations/12"
}
```

---

## Favoritos

### GET /api/favorites

Lista los favoritos. Ordenados por `createdAt DESC`.

**Autenticación:** Requerida

**Parámetros de consulta:**

| Parámetro | Descripción                  | Ejemplo                      |
| --------- | ---------------------------- | ---------------------------- |
| `user`    | Filtrar por IRI del usuario  | `?user=/api/users/3`         |
| `vehicle` | Filtrar por IRI del vehículo | `?vehicle=/api/vehicles/425` |

**Response 200 OK:**

```json
{
    "hydra:member": [
        {
            "id": 8,
            "user": { "id": 3 },
            "vehicle": {
                "id": 425,
                "@id": "/api/vehicles/425"
            },
            "createdAt": "2026-03-10T12:00:00+01:00"
        }
    ],
    "hydra:totalItems": 5
}
```

---

### GET /api/favorites/{id}

Obtiene un favorito por su ID.

**Autenticación:** Requerida

---

### POST /api/favorites

Añade un vehículo a favoritos.

**Autenticación:** Requerida

**Request Body:**

```json
{
    "user": "/api/users/3",
    "vehicle": "/api/vehicles/425"
}
```

> No se puede duplicar la combinación usuario+vehículo. Devuelve `422` si ya existe.

**Response 201 Created:**

```json
{
    "id": 9,
    "user": { "id": 3 },
    "vehicle": { "id": 425 },
    "createdAt": "2026-03-19T15:45:00+01:00"
}
```

---

### DELETE /api/favorites/{id}

Elimina un favorito.

**Autenticación:** Requerida

**Response:** `204 No Content`

---

## Marcas

### GET /api/brands

Lista todas las marcas.

**Autenticación:** No requerida

**Response:**

```json
{
    "hydra:member": [
        { "id": 1, "name": "Toyota", "logo": "toyota.png" },
        { "id": 2, "name": "Audi", "logo": "audi.png" }
    ],
    "hydra:totalItems": 25
}
```

### GET /api/brands/{id}

**Autenticación:** No requerida

### POST /api/brands

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Request Body:**

```json
{ "name": "Ferrari", "logo": "ferrari.png" }
```

### PUT /api/brands/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

### PATCH /api/brands/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Headers:** `Content-Type: application/merge-patch+json`

### DELETE /api/brands/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

---

## Modelos

### GET /api/models

**Autenticación:** No requerida

**Response:**

```json
{
    "hydra:member": [
        { "id": 5, "name": "Corolla", "brand": { "name": "Toyota" } }
    ]
}
```

### GET /api/models/{id} · POST · PUT · PATCH · DELETE /api/models/{id}

Misma estructura que Marcas. POST/PUT/PATCH/DELETE requieren `ROLE_ADMIN`.

**Request Body para POST/PUT:**

```json
{
    "name": "A6",
    "brand": "/api/brands/2"
}
```

---

## Colores

### GET /api/colors · GET /api/colors/{id}

**Autenticación:** No requerida

**Response:**

```json
{ "id": 1, "name": "Rojo", "hexCode": "#FE0000" }
```

### POST /api/colors

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Request Body:**

```json
{ "name": "Azul Marino", "hexCode": "#001F5B" }
```

### PUT · PATCH · DELETE /api/colors/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

---

## Combustibles

### GET /api/fuels · GET /api/fuels/{id}

**Autenticación:** No requerida

**Response:**

```json
{ "id": 39, "name": "Gasolina" }
```

### POST /api/fuels

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Request Body:**

```json
{ "name": "Hidrógeno" }
```

### PUT · PATCH · DELETE /api/fuels/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

---

## Transmisiones

### GET /api/transmissions · GET /api/transmissions/{id}

**Autenticación:** No requerida

**Response:**

```json
{ "id": 1, "name": "Manual" }
```

### POST · PUT · PATCH · DELETE /api/transmissions/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Request Body para POST:**

```json
{ "name": "CVT" }
```

---

## Tipos de carrocería

### GET /api/body_types · GET /api/body_types/{id}

**Autenticación:** No requerida

**Response:**

```json
{ "id": 2, "name": "Sedán" }
```

### POST · PATCH · DELETE /api/body_types/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Request Body para POST:**

```json
{ "name": "Pickup" }
```

---

## Distintivos ambientales

### GET /api/enviromental_badges · GET /api/enviromental_badges/{id}

**Autenticación:** No requerida

**Response:**

```json
{
    "id": 3,
    "name": "ECO",
    "image": "eco_badge.png",
    "imageUrl": "/images/enviromentalBadges/eco_badge.png"
}
```

### POST · PATCH · DELETE /api/enviromental_badges/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Request Body para POST:**

```json
{ "name": "CERO", "image": "cero_badge.png" }
```

---

## Provincias

### GET /api/provinces · GET /api/provinces/{id}

**Autenticación:** No requerida

**Response:**

```json
{ "id": 8, "name": "Madrid" }
```

### POST · PUT · PATCH · DELETE /api/provinces/{id}

**Autenticación:** Requerida (`ROLE_ADMIN`)

**Request Body para POST:**

```json
{ "name": "Girona" }
```

---

## Estadísticas del panel

### GET /api/stats

Devuelve estadísticas globales para el dashboard de administración.

**Autenticación:** Requerida

**Response 200 OK:**

```json
{
    "totalUsers": 52,
    "totalVehicles": 120,
    "vehiclesAvailable": 85,
    "vehiclesSold": 30,
    "vehiclesReserved": 5,
    "totalMessages": 340,
    "totalBrands": 18,
    "recentActivity": [
        {
            "type": "MESSAGE",
            "text": "Mensaje en chat #12: \"Hola, me interesa reservar...\"",
            "date": "2026-03-19T15:30:00+01:00"
        }
    ],
    "serverTime": {
        "date": "2026-03-19T16:00:00+01:00"
    }
}
```

---

## Filtros y paginación

### Paginación

Todos los endpoints de colección soportan paginación con el parámetro `page`:

```
GET /api/vehicles?page=2
```

El número de elementos por página es **20** por defecto para vehículos. La respuesta incluye `hydra:totalItems` y `hydra:view` con los enlaces a primera, última, anterior y siguiente página.

### Filtros de reservas

```
GET /api/reservations?user.id=3
GET /api/reservations?vehicle.id=425&status=CONFIRMED
GET /api/reservations?status=PENDING
```

### Filtros de favoritos

```
GET /api/favorites?user=/api/users/3
GET /api/favorites?vehicle=/api/vehicles/425
```

### Filtros de conversaciones

```
GET /api/conversations?status=NEW
GET /api/conversations?contactEmail=juan@example.com
```

---

## Lógica de negocio importante

### Cálculo automático del precio total de reserva

Al crear una reserva (`POST /api/reservations`), el campo `totalPrice` se calcula automáticamente en el backend:

```
totalPrice = vehicle.dailyPrice × número_de_días
```

Si la diferencia en días es 0 (mismo día de entrada y salida), se cuenta como 1 día.

### Creación automática de conversación al reservar

Cada vez que se crea una reserva, el sistema crea automáticamente una **conversación** entre el usuario y el equipo de administración, con un mensaje inicial que incluye las fechas y el precio total. Esto permite que el admin pueda confirmar o rechazar la reserva directamente desde el chat.

### Bloqueo de fechas

Las fechas se bloquean **únicamente** para reservas con estado `CONFIRMED`. Las reservas `PENDING`, `REJECTED` y `CANCELLED` no bloquean fechas. Esto significa que:

- Un usuario puede solicitar reservar fechas que tienen una reserva pendiente de otro usuario
- Solo cuando el admin confirma (`CONFIRMED`) esas fechas quedan definitivamente bloqueadas

### Ocultación de vehículos eliminados

Los vehículos con `status=DELETED` están ocultos globalmente mediante la extensión `HideDeletedVehiclesExtension`. Nunca aparecen en ninguna consulta, independientemente de los filtros aplicados.

---

## Manejo de errores

### 401 Unauthorized

```json
{
    "code": 401,
    "message": "JWT Token not found"
}
```

### 403 Forbidden

```json
{
    "hydra:title": "An error occurred",
    "hydra:description": "Access Denied."
}
```

### 404 Not Found

```json
{
    "@type": "hydra:Error",
    "hydra:title": "An error occurred",
    "hydra:description": "Not Found"
}
```

### 422 Unprocessable Entity (errores de validación)

```json
{
    "@type": "ConstraintViolationList",
    "hydra:title": "An error occurred",
    "hydra:description": "email: Ya existe una cuenta con este email.",
    "violations": [
        {
            "propertyPath": "email",
            "message": "Ya existe una cuenta con este email.",
            "code": "23bd9dbf-6b9b-41cd-a99e-4844bcf3077f"
        }
    ]
}
```

---

**Stack tecnológico:** PHP 8.2 · Symfony 7.3 · API Platform 4.2 · Doctrine ORM 3.5 · MySQL 8.0 · LexikJWT 3.2 · NelmioCORS 2.6
