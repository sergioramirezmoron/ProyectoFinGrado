# Backend - Luxury Cars API

Backend desarrollado con **Symfony 7.3** y **API Platform 4.2** para la gestión de vehículos, reservas, chat en tiempo real y administración de usuarios.

---

## Índice

- [Stack Tecnológico](#-stack-tecnológico)

- [Requisitos Previos](#-requisitos-previos)

- [Instalación](#-instalación)

- [Configuración](#-configuración)

- [Base de Datos](#-base-de-datos)

- [Autenticación JWT](#-autenticación-jwt)

- [Comandos Útiles](#-comandos-útiles)

- [API Endpoints](#-api-endpoints)

- [Estructura del Proyecto](#-estructura-del-proyecto)

- [Backup Automático](#-backup-automático)

- [Troubleshooting](#-troubleshooting)

---

## 🛠️ Stack Tecnológico

| Tecnología                       | Versión | Propósito                     |
| -------------------------------- | ------- | ----------------------------- |
| **PHP**                          | 8.2+    | Lenguaje base                 |
| **Symfony**                      | 7.3     | Framework PHP                 |
| **API Platform**                 | 4.2     | API REST automatizada         |
| **Doctrine ORM**                 | 3.5     | Mapeo objeto-relacional       |
| **MySQL**                        | 8.0+    | Base de datos relacional      |
| **LexikJWTAuthenticationBundle** | 3.2     | Autenticación por tokens JWT  |
| **Doctrine Fixtures**            | 4.3     | Datos de prueba               |

---

## ✅ Requisitos Previos

Asegúrate de tener instalado:

- **PHP** >= 8.2

- **Composer** >= 2.0

- **MySQL** >= 8.0

---

## Instalación

### 1️⃣ Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd backend
```

### 2️⃣ Instalar dependencias

```bash
composer install
```

### 3️⃣ Copiar archivo de variables de entorno

```bash
cp .env.example .env.local
```

---

## ⚙️ Configuración

### Variables de entorno (.env.local)

Crea un archivo `.env.local`

Edita el archivo `.env.local` con tus credenciales:

```javascript
DATABASE_URL="mysql://root:@127.0.0.1:3306/automocion?serverVersion=8.0&charset=utf8mb4"
JWT_PASSPHRASE=TU_PASSPHRASE_SEGURA
APP_SECRET=TU_SECRET_GENERADO_AQUI
APP_ENV=dev
```

> **Nota**: Cambia `root:` por `usuario:contraseña` según tu configuración de MySQL.

---

## 🗄️ Base de Datos

### 1️⃣ Crear la base de datos

```bash
php bin/console doctrine:database:create
```

### 2️⃣ Ejecutar migraciones

```bash
php bin/console doctrine:migrations:migrate
```

### 3️⃣ Cargar datos de prueba (opcional)

```bash
php bin/console doctrine:fixtures:load
```

> **Advertencia**: Este comando eliminará todos los datos existentes y cargará datos de ejemplo.

---

## 🔐 Autenticación JWT

### Generar claves pública y privada

```bash
php bin/console lexik:jwt:generate-keypair
```

Esto creará automáticamente:

- `config/jwt/private.pem` (clave privada)

- `config/jwt/public.pem` (clave pública)

> **Importante**: La passphrase en `.env` (`JWT_PASSPHRASE`) debe coincidir con la que uses al generar las claves. Si no estableces una passphrase durante la generación, déjala vacía en el `.env.local`.

### Verificar las claves generadas

```bash
ls -la config/jwt/
```

Deberías ver ambos archivos `.pem` creados.

---

## 🚀 Comandos Útiles

### Iniciar servidor de desarrollo

**Opción 1 - Con Symfony CLI:**

```bash
symfony server:start
```

El servidor estará disponible en: `http://localhost:8000`

### Limpiar caché

```bash
php bin/console cache:clear
```

### Crear una nueva migración

```bash
php bin/console make:migration
php bin/console doctrine:migrations:migrate
```

### Crear una nueva entidad

```bash
php bin/console make:entity
```

### Ver todas las rutas de la API

```bash
php bin/console debug:router
```

---

## 📡 API Endpoints

### Autenticación

| Método | Endpoint           | Descripción               | Body                                        |
| ------ | ------------------ | ------------------------- | ------------------------------------------- |
| POST   | `/api/login_check` | Login y obtención de JWT  | `{"username": "email", "password": "pass"}` |
| POST   | `/api/register`    | Registro de nuevo usuario | `{"email": "...", "password": "..."}`       |

### Vehículos

| Método | Endpoint             | Descripción         | Autenticación |
| ------ | -------------------- | ------------------- | ------------- |
| GET    | `/api/vehicles`      | Listar vehículos    | No            |
| GET    | `/api/vehicles/{id}` | Detalle de vehículo | No            |
| POST   | `/api/vehicles`      | Crear vehículo      | Admin         |
| PUT    | `/api/vehicles/{id}` | Actualizar vehículo | Admin         |
| DELETE | `/api/vehicles/{id}` | Eliminar vehículo   | Admin         |

### Reservas

| Método | Endpoint                 | Descripción                  | Autenticación |
| ------ | ------------------------ | ---------------------------- | ------------- |
| GET    | `/api/reservations`      | Listar reservas del usuario  | Usuario       |
| POST   | `/api/reservations`      | Crear nueva reserva          | Usuario       |
| PATCH  | `/api/reservations/{id}` | Actualizar estado de reserva | Admin         |

### Conversaciones (Chat)

| Método | Endpoint                  | Descripción             | Autenticación |
| ------ | ------------------------- | ----------------------- | ------------- |
| GET    | `/api/conversations`      | Listar conversaciones   | Usuario       |
| GET    | `/api/conversations/{id}` | Detalle de conversación | Usuario       |
| POST   | `/api/messages`           | Enviar mensaje          | Usuario       |
| PATCH  | `/api/conversations/{id}` | Marcar como leída       | Usuario       |

### Usuarios

| Método | Endpoint          | Descripción                      | Autenticación |
| ------ | ----------------- | -------------------------------- | ------------- |
| GET    | `/api/users/me`   | Obtener datos del usuario actual | Usuario       |
| PUT    | `/api/users/{id}` | Actualizar perfil                | Usuario       |

> **Documentación interactiva completa**: Accede a `/api/docs` con el servidor corriendo para explorar todos los endpoints con Swagger UI.

---

## 📁 Estructura del Proyecto

```
backend/
├── config/                    # Configuración de Symfony
│   ├── packages/             # Configuración de bundles
│   │   ├── doctrine.yaml     # Configuración de Doctrine ORM
│   │   ├── lexik_jwt.yaml    # Configuración JWT
│   │   ├── nelmio_cors.yaml  # Configuración CORS
│   │   └── security.yaml     # Configuración de seguridad
│   ├── routes/               # Definición de rutas
│   └── jwt/                  # Claves JWT (generadas)
│       ├── private.pem
│       └── public.pem
├── migrations/               # Migraciones de base de datos
├── public/                   # Punto de entrada público
│   ├── images/              # Imágenes de vehículos subidas
│   └── index.php            # Front controller
├── src/
│   ├── ApiResource/         # Recursos de API Platform (DTOs)
│   ├── Controller/          # Controladores personalizados
│   ├── DataFixtures/        # Datos de prueba
│   ├── Doctrine/            # Event listeners de Doctrine
│   ├── Entity/              # Entidades (modelos de BD)
│   ├── EventListener/       # Listeners de eventos
│   ├── Form/                # Formularios Symfony
│   ├── Repository/          # Repositorios de Doctrine
│   ├── Security/            # Lógica de autenticación
│   ├── State/               # PasswordHasher
│   └── Validator/           # Validadores personalizados
├── templates/               # Plantillas Twig
├── tests/                   # Tests unitarios y funcionales
├── .env.example             # Plantilla de variables de entorno
├── composer.json            # Dependencias PHP
└── symfony.lock             # Lock de versiones Symfony
```

---

## 💾 Backup Automático

El proyecto incluye un **script de backup automático** que se ejecuta cada 24 horas para respaldar la base de datos.

### Configuración del backup

El script se encuentra en la raíz del proyecto y genera un SQL de la base de datos `automocion`.

## 🖼️ Gestión de Imágenes

Las imágenes de los vehículos se almacenan en el servidor en la carpeta:

```
public/images/
```

### Subir imágenes

Las imágenes se suben mediante el endpoint de vehículos usando `multipart/form-data`.

### Permisos necesarios

Asegúrate de que la carpeta tenga permisos de escritura:

```bash
chmod -R 775 public/images
chown -R www-data:www-data public/images  # En producción
```

---

## 🐛 Troubleshooting

### Error: "Access denied for user"

**Causa**: Credenciales incorrectas en `DATABASE_URL`.

**Solución**: Verifica usuario, contraseña y nombre de base de datos en `.env.local`:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/automocion?serverVersion=8.0"
```

---

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa**: Frontend intentando acceder desde un origen no permitido.

**Solución**: Actualiza `CORS_ALLOW_ORIGIN` en `.env` para incluir tu dominio frontend:

```env
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

O edita `config/packages/nelmio_cors.yaml`.

---

### Error: "Unable to find the public key"

**Causa**: Las claves JWT no han sido generadas.

**Solución**: Genera las claves con:

```bash
php bin/console lexik:jwt:generate-keypair
```

Verifica que existan en `config/jwt/`:

```bash
ls config/jwt/
```

Deberías ver: `private.pem` y `public.pem`

---

### Error: "Failed to open stream: Permission denied" al subir imágenes

**Causa**: La carpeta `public/images` no tiene permisos de escritura.

**Solución**:

```bash
chmod -R 775 public/images
```

En entornos de producción:

```bash
chown -R www-data:www-data public/images
```

---

### Error: "Database 'automocion' doesn't exist"

**Causa**: La base de datos no ha sido creada.

**Solución**:

```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

---

### Error al ejecutar fixtures: "Integrity constraint violation"

**Causa**: Datos duplicados o relaciones inconsistentes.

**Solución**: Elimina toda la base de datos y recréala:

```bash
php bin/console doctrine:database:drop --force
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load --no-interaction
```

---

### Warning: "Deprecated Symfony..."

**Causa**: Advertencias de deprecación en desarrollo.

**Solución**: Estas advertencias son normales en modo `dev`. Para ocultarlas, cambia en `.env.local`:

```env
APP_ENV=prod
```

O actualiza las dependencias:

```bash
composer update
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Symfony](https://symfony.com/doc/current/index.html)

- [Documentación de API Platform](https://api-platform.com/docs/)

- [Doctrine ORM](https://www.doctrine-project.org/projects/doctrine-orm/en/latest/)

- [LexikJWTAuthenticationBundle](https://github.com/lexik/LexikJWTAuthenticationBundle)

---

**Desarrollado por Sergio Ramírez Morón**
