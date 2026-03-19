# 📚 Documentación de la API - Luxury Cars Backend

Documentación completa de los endpoints de la API REST desarrollada con Symfony 7.3 y API Platform 4.2.

---

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Autenticación](#autenticación)
- [Estructura de Respuestas](#estructura-de-respuestas)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Endpoints](#endpoints)
    - [Autenticación](#endpoints-de-autenticación)
    - [Usuarios](#usuarios)
    - [Vehículos](#vehículos)
    - [Reservas](#reservas)
    - [Conversaciones y Mensajes](#conversaciones-y-mensajes)
    - [Favoritos](#favoritos)
    - [Catálogos](#catálogos)
- [Filtros y Paginación](#filtros-y-paginación)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Manejo de Errores](#manejo-de-errores)

---

## 🔰 Introducción

Base URL: `http://localhost:3000/api`

La API utiliza el formato **JSON-LD** con **Hydra** para representar colecciones y relaciones entre recursos.

### Características principales:

- **API Platform 4.2**: Generación automática de endpoints RESTful
- **JWT Authentication**: Autenticación mediante tokens Bearer
- **CORS**: Configurado para permitir peticiones desde el frontend
- **Paginación**: 20 elementos por página por defecto
- **Filtros**: Búsqueda y filtrado avanzado en colecciones

---

## 🔐 Autenticación

### Obtener Token JWT

**Endpoint:** `POST /api/login_check`

**Request:**

```json
{
    "email": "usuario@example.com",
    "password": "contraseña123"
}
```

**Response (200 OK):**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**

```json
{
    "code": 401,
    "message": "Invalid credentials."
}
```

### Usar el Token

Incluye el token en el header `Authorization` de todas las peticiones protegidas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles de Usuario

| Rol          | Descripción        | Permisos                            |
| ------------ | ------------------ | ----------------------------------- |
| `ROLE_USER`  | Usuario registrado | Crear reservas, chat, favoritos     |
| `ROLE_SALES` | Vendedor           | Gestionar vehículos, conversaciones |
| `ROLE_ADMIN` | Administrador      | Acceso total a todos los recursos   |

---

## 📦 Estructura de Respuestas

### Colecciones (Listas)

Las colecciones utilizan el formato **Hydra Collection** con metadatos de paginación:

```json
{
    "@context": "/api/contexts/Vehicle",
    "@id": "/api/vehicles",
    "@type": "hydra:Collection",
    "hydra:member": [
        {
            "id": 427,
            "brand": { "name": "Toyota" },
            "model": { "name": "Yaris" },
            "price": "32599",
            "year": 2026,
            "status": "AVAILABLE",
            "type": "SALE"
        }
    ],
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

### Recursos Individuales

Los recursos individuales incluyen `@id` y `@type`:

```json
{
    "@context": "/api/contexts/Vehicle",
    "@id": "/api/vehicles/427",
    "@type": "Vehicle",
    "id": 427,
    "brand": { "name": "Toyota" },
    "model": { "name": "Yaris" },
    "price": "32599",
    "status": "AVAILABLE"
}
```

---

## 🚦 Códigos de Estado HTTP

| Código | Significado           | Descripción                      |
| ------ | --------------------- | -------------------------------- |
| `200`  | OK                    | Petición exitosa                 |
| `201`  | Created               | Recurso creado exitosamente      |
| `204`  | No Content            | Recurso eliminado exitosamente   |
| `400`  | Bad Request           | Datos inválidos en la petición   |
| `401`  | Unauthorized          | Token JWT inválido o ausente     |
| `403`  | Forbidden             | Sin permisos para esta operación |
| `404`  | Not Found             | Recurso no encontrado            |
| `422`  | Unprocessable Entity  | Errores de validación            |
| `500`  | Internal Server Error | Error del servidor               |

---

## 📡 Endpoints

---

## 🔑 Endpoints de Autenticación

### Login

Genera un token JWT para autenticación.

**Endpoint:** `POST /api/login_check`

**Autenticación:** No requerida

**Request Body:**

```json
{
    "email": "admin@example.com",
    "password": "admin123"
}
```

**Response (200 OK):**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdfQ..."
}
```

---

## 👥 Usuarios

### Listar Usuarios

**Endpoint:** `GET /api/users`

**Autenticación:** Requerida (Admin)

**Response:**

```json
{
    "hydra:member": [
        {
            "id": 1,
            "email": "usuario@example.com",
            "roles": ["ROLE_USER"],
            "name": "Juan",
            "surname": "Pérez",
            "phone": "666777888",
            "province": {
                "name": "Madrid"
            }
        }
    ],
    "hydra:totalItems": 50
}
```

### Obtener Usuario

**Endpoint:** `GET /api/users/{id}`

**Autenticación:** Requerida

**Response:**

```json
{
    "id": 1,
    "email": "usuario@example.com",
    "roles": ["ROLE_USER"],
    "name": "Juan",
    "surname": "Pérez",
    "phone": "666777888",
    "province": {
        "name": "Madrid"
    }
}
```

### Crear Usuario (Registro)

**Endpoint:** `POST /api/users`

**Autenticación:** No requerida

**Request Body:**

```json
{
    "email": "nuevo@example.com",
    "plainPassword": "password123",
    "name": "María",
    "surname": "García",
    "phone": "666111222",
    "province": "/api/provinces/1"
}
```

**Response (201 Created):**

```json
{
    "id": 52,
    "email": "nuevo@example.com",
    "roles": ["ROLE_USER"],
    "name": "María"
}
```

### Actualizar Usuario

**Endpoint:** `PATCH /api/users/{id}`

**Autenticación:** Requerida (propio usuario o Admin)

**Headers:**

```
Content-Type: application/merge-patch+json
Authorization: Bearer {token}
```

**Request Body:**

```json
{
    "name": "María Actualizada",
    "phone": "666999888"
}
```

### Eliminar Usuario

**Endpoint:** `DELETE /api/users/{id}`

**Autenticación:** Requerida (Admin)

**Response:** `204 No Content`

---

## 🚗 Vehículos

### Listar Vehículos

**Endpoint:** `GET /api/vehicles`

**Autenticación:** No requerida (acceso público)

**Parámetros de consulta:**

| Parámetro         | Tipo    | Descripción                              | Ejemplo                  |
| ----------------- | ------- | ---------------------------------------- | ------------------------ |
| `page`            | integer | Número de página                         | `?page=2`                |
| `type`            | string  | Tipo de vehículo (`SALE` o `RENT`)       | `?type=SALE`             |
| `status`          | string  | Estado (`AVAILABLE`, `SOLD`, `RESERVED`) | `?status=AVAILABLE`      |
| `brand`           | integer | ID de marca                              | `?brand=5`               |
| `model`           | integer | ID de modelo                             | `?model=12`              |
| `fuelType`        | integer | ID de combustible                        | `?fuelType=39`           |
| `transmission`    | integer | ID de transmisión                        | `?transmission=1`        |
| `province`        | integer | ID de provincia                          | `?province=8`            |
| `price[gte]`      | string  | Precio mínimo                            | `?price[gte]=20000`      |
| `price[lte]`      | string  | Precio máximo                            | `?price[lte]=50000`      |
| `year[gte]`       | integer | Año mínimo                               | `?year[gte]=2020`        |
| `kilometres[lte]` | integer | Kilómetros máximos                       | `?kilometres[lte]=50000` |
| `power[gte]`      | integer | Potencia mínima                          | `?power[gte]=100`        |
| `order[price]`    | string  | Ordenar por precio (`asc` o `desc`)      | `?order[price]=asc`      |

**Ejemplo de URL con filtros:**

```
GET /api/vehicles?type=SALE&status=AVAILABLE&price[gte]=20000&price[lte]=50000&year[gte]=2020&order[price]=asc
```

**Response:**

```json
{
    "hydra:member": [
        {
            "id": 427,
            "brand": {
                "name": "Toyota"
            },
            "model": {
                "name": "Yaris"
            },
            "price": "32599",
            "year": 2026,
            "kilometres": 54333,
            "power": 100,
            "displacement": 1000,
            "fuelType": {
                "id": 40,
                "name": "Diesel"
            },
            "transmission": {
                "name": "Manual"
            },
            "bodyType": {
                "name": "Compacto"
            },
            "enviromentalBadge": {
                "name": "B",
                "imageUrl": "/images/enviromentalBadges/"
            },
            "color": {
                "name": "Rojo",
                "hexCode": "#FE0000"
            },
            "doors": 5,
            "owners": 1,
            "description": "Descripción del vehículo",
            "status": "AVAILABLE",
            "createdAt": "2026-02-28T12:36:25+01:00",
            "vehicleImages": [
                {
                    "id": 183,
                    "filename": "69a2d3398afc7.jpg",
                    "main": false,
                    "imageUrl": "/images/vehicles/69a2d3398afc7.jpg"
                }
            ],
            "visible": true,
            "province": {
                "name": "Bilbao"
            },
            "type": "SALE",
            "dailyPrice": null
        }
    ],
    "hydra:totalItems": 120
}
```

### Obtener Vehículo por ID

**Endpoint:** `GET /api/vehicles/{id}`

**Autenticación:** No requerida

**Response:**

```json
{
    "id": 425,
    "brand": {
        "name": "Audi"
    },
    "model": {
        "name": "A4"
    },
    "price": null,
    "year": 2020,
    "kilometres": 82000,
    "power": 150,
    "displacement": 2500,
    "fuelType": {
        "id": 40,
        "name": "Diesel"
    },
    "transmission": {
        "name": "Manual"
    },
    "bodyType": {
        "name": "Sedán"
    },
    "enviromentalBadge": {
        "name": "ECO",
        "imageUrl": "/images/enviromentalBadges/"
    },
    "color": {
        "name": "Blanco",
        "hexCode": "#ffffff"
    },
    "doors": 5,
    "owners": 2,
    "description": "Elegancia, tecnología y eficiencia...",
    "status": "AVAILABLE",
    "createdAt": "2026-02-08T21:13:25+01:00",
    "vehicleImages": [
        {
            "id": 180,
            "filename": "699c9f24aa3a1.jpg",
            "main": false,
            "imageUrl": "/images/vehicles/699c9f24aa3a1.jpg"
        }
    ],
    "visible": true,
    "province": {
        "name": "Barcelona"
    },
    "type": "RENT",
    "dailyPrice": "21.00"
}
```

### Crear Vehículo

**Endpoint:** `POST /api/vehicles`

**Autenticación:** Requerida (Admin o Sales)

**Request Body:**

```json
{
    "brand": "/api/brands/1",
    "model": "/api/models/5",
    "price": "35000",
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
    "description": "Vehículo en excelente estado",
    "status": "AVAILABLE",
    "visible": true,
    "province": "/api/provinces/8",
    "type": "SALE",
    "dailyPrice": null
}
```

**Response (201 Created):**

```json
{
    "id": 428,
    "brand": {
        "name": "Toyota"
    },
    "model": {
        "name": "Corolla"
    },
    "status": "AVAILABLE"
}
```

### Actualizar Vehículo

**Endpoint:** `PATCH /api/vehicles/{id}`

**Autenticación:** Requerida (Admin o Sales)

**Headers:**

```
Content-Type: application/merge-patch+json
```

**Request Body:**

```json
{
    "price": "33000",
    "status": "SOLD"
}
```

### Actualizar Vehículo Completo

**Endpoint:** `PUT /api/vehicles/{id}`

**Autenticación:** Requerida (Admin o Sales)

**Request Body:** Mismo formato que POST (todos los campos requeridos)

### Eliminar Vehículo

**Endpoint:** `DELETE /api/vehicles/{id}`

**Autenticación:** Requerida (Admin)

**Response:** `204 No Content`

---

## 📅 Reservas

### Listar Reservas

**Endpoint:** `GET /api/reservations`

**Autenticación:** Requerida

**Parámetros de consulta:**

| Parámetro    | Descripción          | Ejemplo           |
| ------------ | -------------------- | ----------------- |
| `vehicle.id` | Filtrar por vehículo | `?vehicle.id=425` |
| `status`     | Filtrar por estado   | `?status=PENDING` |

**Estados posibles:**

- `PENDING`: Pendiente de confirmación
- `CONFIRMED`: Confirmada por administrador
- `REJECTED`: Rechazada por administrador

**Response:**

```json
{
    "hydra:member": [
        {
            "id": 15,
            "startDate": "2026-04-01T00:00:00+02:00",
            "endDate": "2026-04-05T00:00:00+02:00",
            "status": "PENDING",
            "totalPrice": 84.0,
            "vehicle": {
                "id": 425,
                "brand": {
                    "name": "Audi"
                },
                "model": {
                    "name": "A4"
                }
            },
            "user": "/api/users/3"
        }
    ],
    "hydra:totalItems": 25
}
```

### Obtener Reserva por ID

**Endpoint:** `GET /api/reservations/{id}`

**Autenticación:** Requerida

**Response:**

```json
{
    "id": 15,
    "startDate": "2026-04-01T00:00:00+02:00",
    "endDate": "2026-04-05T00:00:00+02:00",
    "status": "PENDING",
    "totalPrice": 84.0,
    "vehicle": {
        "id": 425
    },
    "user": "/api/users/3"
}
```

### Crear Reserva

**Endpoint:** `POST /api/reservations`

**Autenticación:** Requerida

**Request Body:**

```json
{
    "startDate": "2026-05-10T00:00:00+02:00",
    "endDate": "2026-05-15T00:00:00+02:00",
    "vehicle": "/api/vehicles/425",
    "user": "/api/users/3",
    "status": "PENDING"
}
```

**Validaciones:**

- La fecha de inicio debe ser futura
- La fecha de fin debe ser posterior a la de inicio
- No puede haber solapamiento con otras reservas confirmadas del mismo vehículo

**Response (201 Created):**

```json
{
    "id": 16,
    "startDate": "2026-05-10T00:00:00+02:00",
    "endDate": "2026-05-15T00:00:00+02:00",
    "status": "PENDING",
    "totalPrice": 105.0,
    "vehicle": {
        "id": 425
    }
}
```

**Response (422 Validation Error):**

```json
{
    "@type": "ConstraintViolationList",
    "hydra:title": "An error occurred",
    "violations": [
        {
            "propertyPath": "startDate",
            "message": "La fecha de inicio debe ser futura"
        }
    ]
}
```

### Actualizar Estado de Reserva

**Endpoint:** `PATCH /api/reservations/{id}`

**Autenticación:** Requerida (Admin)

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

**Estados permitidos:**

- `PENDING` → `CONFIRMED`
- `PENDING` → `REJECTED`

### Eliminar Reserva

**Endpoint:** `DELETE /api/reservations/{id}`

**Autenticación:** Requerida (Usuario propietario o Admin)

**Response:** `204 No Content`

---

## 💬 Conversaciones y Mensajes

### Listar Conversaciones

**Endpoint:** `GET /api/conversations`

**Autenticación:** Requerida

**Response:**

```json
{
    "hydra:member": [
        {
            "id": 12,
            "contactName": "Juan Pérez",
            "contactEmail": "juan@example.com",
            "contactPhone": "666777888",
            "vehicle": {
                "brand": {
                    "name": "Audi"
                },
                "model": {
                    "name": "A4"
                },
                "status": "AVAILABLE",
                "vehicleImages": []
            },
            "messages": [
                {
                    "id": 45,
                    "content": "Hola, ¿está disponible?",
                    "createdAt": "2026-03-15T10:30:00+01:00",
                    "isAdmin": false
                }
            ],
            "createdAt": "2026-03-15T10:30:00+01:00",
            "updatedAt": "2026-03-15T10:30:00+01:00",
            "status": "UNREAD",
            "reservation": null
        }
    ],
    "hydra:totalItems": 8
}
```

### Obtener Conversación por ID

**Endpoint:** `GET /api/conversations/{id}`

**Autenticación:** Requerida

**Response:**

```json
{
    "id": 12,
    "contactName": "Juan Pérez",
    "contactEmail": "juan@example.com",
    "contactPhone": "666777888",
    "vehicle": {
        "brand": {
            "name": "Audi"
        },
        "model": {
            "name": "A4"
        }
    },
    "messages": [
        {
            "id": 45,
            "content": "Hola, ¿está disponible?",
            "createdAt": "2026-03-15T10:30:00+01:00",
            "isAdmin": false
        },
        {
            "id": 46,
            "content": "Sí, está disponible. ¿Cuándo desea verlo?",
            "createdAt": "2026-03-15T11:00:00+01:00",
            "isAdmin": true
        }
    ],
    "status": "READ",
    "reservation": {
        "id": 15,
        "startDate": "2026-04-01T00:00:00+02:00",
        "endDate": "2026-04-05T00:00:00+02:00",
        "status": "PENDING",
        "totalPrice": 84.0
    }
}
```

### Crear Conversación

**Endpoint:** `POST /api/conversations`

**Autenticación:** Requerida

**Request Body:**

```json
{
    "contactName": "María García",
    "contactEmail": "maria@example.com",
    "contactPhone": "666111222",
    "vehicle": "/api/vehicles/425",
    "status": "UNREAD",
    "user": "/api/users/5"
}
```

### Actualizar Estado de Conversación

**Endpoint:** `PATCH /api/conversations/{id}`

**Autenticación:** Requerida

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

### Enviar Mensaje

**Endpoint:** `POST /api/messages`

**Autenticación:** Requerida

**Request Body:**

```json
{
    "content": "Hola, me interesa este vehículo",
    "isAdmin": false,
    "conversation": "/api/conversations/12"
}
```

**Response (201 Created):**

```json
{
    "id": 47,
    "content": "Hola, me interesa este vehículo",
    "createdAt": "2026-03-19T15:30:00+01:00",
    "isAdmin": false,
    "conversation": "/api/conversations/12"
}
```

---

## ⭐ Favoritos

### Listar Favoritos

**Endpoint:** `GET /api/favorites`

**Autenticación:** Requerida

**Response:**

```json
{
    "hydra:member": [
        {
            "id": 8,
            "user": {
                "id": 3
            },
            "vehicle": {
                "id": 425,
                "brand": {
                    "name": "Audi"
                },
                "model": {
                    "name": "A4"
                }
            },
            "createdAt": "2026-03-10T12:00:00+01:00"
        }
    ],
    "hydra:totalItems": 5
}
```

### Obtener Favorito

**Endpoint:** `GET /api/favorites/{id}`

**Autenticación:** Requerida

### Añadir a Favoritos

**Endpoint:** `POST /api/favorites`

**Autenticación:** Requerida

**Request Body:**

```json
{
    "user": "/api/users/3",
    "vehicle": "/api/vehicles/425"
}
```

**Response (201 Created):**

```json
{
    "id": 9,
    "user": {
        "id": 3
    },
    "vehicle": {
        "id": 425
    },
    "createdAt": "2026-03-19T15:45:00+01:00"
}
```

### Eliminar de Favoritos

**Endpoint:** `DELETE /api/favorites/{id}`

**Autenticación:** Requerida

**Response:** `204 No Content`

---

## 📂 Catálogos

Todos los endpoints de catálogos tienen la misma estructura básica:

### Marcas (Brands)

**Endpoints:**

- `GET /api/brands` - Listar todas las marcas
- `GET /api/brands/{id}` - Obtener marca por ID
- `POST /api/brands` - Crear marca (Admin)
- `PUT /api/brands/{id}` - Actualizar marca completa (Admin)
- `PATCH /api/brands/{id}` - Actualizar marca parcial (Admin)
- `DELETE /api/brands/{id}` - Eliminar marca (Admin)

**Estructura:**

```json
{
    "id": 1,
    "name": "Toyota",
    "logo": "toyota_logo.png"
}
```

### Modelos (Models)

**Endpoints:**

- `GET /api/models` - Listar todos los modelos
- `GET /api/models/{id}` - Obtener modelo por ID
- `POST /api/models` - Crear modelo (Admin)
- `PUT /api/models/{id}` - Actualizar modelo (Admin)
- `PATCH /api/models/{id}` - Actualizar modelo parcial (Admin)
- `DELETE /api/models/{id}` - Eliminar modelo (Admin)

**Estructura:**

```json
{
    "id": 5,
    "name": "Corolla",
    "brand": {
        "name": "Toyota"
    }
}
```

### Colores (Colors)

**Endpoints:**

- `GET /api/colors`
- `GET /api/colors/{id}`
- `POST /api/colors` (Admin)
- `PUT /api/colors/{id}` (Admin)
- `PATCH /api/colors/{id}` (Admin)
- `DELETE /api/colors/{id}` (Admin)

**Estructura:**

```json
{
    "id": 1,
    "name": "Rojo",
    "hexCode": "#FE0000"
}
```

### Combustibles (Fuels)

**Endpoints:**

- `GET /api/fuels`
- `GET /api/fuels/{id}`
- `POST /api/fuels` (Admin)
- `PUT /api/fuels/{id}` (Admin)
- `PATCH /api/fuels/{id}` (Admin)
- `DELETE /api/fuels/{id}` (Admin)

**Estructura:**

```json
{
    "id": 39,
    "name": "Gasolina"
}
```

### Transmisiones (Transmissions)

**Endpoints:**

- `GET /api/transmissions`
- `GET /api/transmissions/{id}`
- `POST /api/transmissions` (Admin)
- `PUT /api/transmissions/{id}` (Admin)
- `PATCH /api/transmissions/{id}` (Admin)
- `DELETE /api/transmissions/{id}` (Admin)

**Estructura:**

```json
{
    "id": 1,
    "name": "Manual"
}
```

### Tipos de Carrocería (Body Types)

**Endpoints:**

- `GET /api/body_types`
- `GET /api/body_types/{id}`
- `POST /api/body_types` (Admin)
- `PATCH /api/body_types/{id}` (Admin)
- `DELETE /api/body_types/{id}` (Admin)

**Estructura:**

```json
{
    "id": 2,
    "name": "Sedán"
}
```

### Distintivos Ambientales (Environmental Badges)

**Endpoints:**

- `GET /api/enviromental_badges`
- `GET /api/enviromental_badges/{id}`
- `POST /api/enviromental_badges` (Admin)
- `PATCH /api/enviromental_badges/{id}` (Admin)
- `DELETE /api/enviromental_badges/{id}` (Admin)

**Estructura:**

```json
{
    "id": 3,
    "name": "ECO",
    "image": "eco_badge.png",
    "imageUrl": "/images/enviromentalBadges/eco_badge.png"
}
```

### Provincias (Provinces)

**Endpoints:**

- `GET /api/provinces`
- `GET /api/provinces/{id}`
- `POST /api/provinces` (Admin)
- `PUT /api/provinces/{id}` (Admin)
- `PATCH /api/provinces/{id}` (Admin)
- `DELETE /api/provinces/{id}` (Admin)

**Estructura:**

```json
{
    "id": 8,
    "name": "Madrid"
}
```

---

## 🔍 Filtros y Paginación

### Paginación

Por defecto, las colecciones devuelven **20 elementos por página**.

**Parámetros:**

- `page`: Número de página (empezando en 1)

**Ejemplo:**

```
GET /api/vehicles?page=2
```

**Respuesta incluye metadatos de paginación:**

```json
{
    "hydra:totalItems": 150,
    "hydra:view": {
        "hydra:first": "/api/vehicles?page=1",
        "hydra:last": "/api/vehicles?page=8",
        "hydra:previous": "/api/vehicles?page=1",
        "hydra:next": "/api/vehicles?page=3"
    }
}
```

### Filtros Disponibles

#### Vehículos

**Filtros exactos:**

```
?brand=1
?model=5
?fuelType=39
?transmission=1
?bodyType=2
?color=1
?province=8
?status=AVAILABLE
?type=SALE
```

**Filtros de rango:**

```
?price[gte]=20000&price[lte]=50000
?year[gte]=2020&year[lte]=2024
?kilometres[lte]=50000
?power[gte]=100
```

**Búsqueda parcial:**

```
?brand.name=Toyo
?model.name=Corolla
```

**Ordenamiento:**

```
?order[price]=asc
?order[year]=desc
?order[createdAt]=desc
```

#### Reservas

```
?vehicle.id=425
?status=PENDING
```

### Ejemplo Completo de Filtrado

```
GET /api/vehicles?type=SALE&status=AVAILABLE&fuelType=39&transmission=1&price[gte]=20000&price[lte]=50000&year[gte]=2020&order[price]=asc&page=1
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Registro y Login

```bash
# 1. Registrarse
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "plainPassword": "password123",
    "name": "Juan",
    "surname": "Pérez",
    "phone": "666777888",
    "province": "/api/provinces/8"
  }'

# 2. Hacer login
curl -X POST http://localhost:3000/api/login_check \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@example.com",
    "password": "password123"
  }'

# Respuesta:
# {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

### Ejemplo 2: Buscar Vehículos de Alquiler

```bash
# Obtener vehículos disponibles para alquiler en Barcelona, diesel, automático
curl -X GET "http://localhost:3000/api/vehicles?type=RENT&status=AVAILABLE&fuelType=40&transmission=2&province=2" \
  -H "Accept: application/json"
```

### Ejemplo 3: Crear una Reserva

```bash
# Crear reserva (requiere autenticación)
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{
    "startDate": "2026-05-10T00:00:00+02:00",
    "endDate": "2026-05-15T00:00:00+02:00",
    "vehicle": "/api/vehicles/425",
    "user": "/api/users/3",
    "status": "PENDING"
  }'
```

### Ejemplo 4: Enviar Mensaje en Chat

```bash
# Crear conversación
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{
    "contactName": "María García",
    "contactEmail": "maria@example.com",
    "contactPhone": "666111222",
    "vehicle": "/api/vehicles/425",
    "status": "UNREAD",
    "user": "/api/users/3"
  }'

# Enviar mensaje
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {tu_token}" \
  -d '{
    "content": "Hola, me interesa reservar este vehículo",
    "isAdmin": false,
    "conversation": "/api/conversations/12"
  }'
```

### Ejemplo 5: Actualizar Estado de Reserva (Admin)

```bash
# Confirmar reserva
curl -X PATCH http://localhost:3000/api/reservations/15 \
  -H "Content-Type: application/merge-patch+json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "status": "CONFIRMED"
  }'
```

---

## ⚠️ Manejo de Errores

### Error 400 - Bad Request

**Causa:** Datos inválidos en la petición

**Response:**

```json
{
    "@type": "hydra:Error",
    "hydra:title": "An error occurred",
    "hydra:description": "Invalid JSON data"
}
```

### Error 401 - Unauthorized

**Causa:** Token JWT inválido, expirado o ausente

**Response:**

```json
{
    "code": 401,
    "message": "Invalid JWT Token"
}
```

### Error 403 - Forbidden

**Causa:** Sin permisos para realizar la operación

**Response:**

```json
{
    "hydra:title": "An error occurred",
    "hydra:description": "Access Denied."
}
```

### Error 404 - Not Found

**Causa:** Recurso no encontrado

**Response:**

```json
{
    "@type": "hydra:Error",
    "hydra:title": "An error occurred",
    "hydra:description": "Not Found"
}
```

### Error 422 - Unprocessable Entity

**Causa:** Errores de validación

**Response:**

```json
{
    "@type": "ConstraintViolationList",
    "hydra:title": "An error occurred",
    "hydra:description": "startDate: La fecha de inicio debe ser futura",
    "violations": [
        {
            "propertyPath": "startDate",
            "message": "La fecha de inicio debe ser futura",
            "code": null
        }
    ]
}
```

---

## 📞 Soporte

Para problemas técnicos o dudas sobre la API, contacta con el equipo de desarrollo.

---

**API desarrollada con Symfony 7.3, API Platform 4.2 y LexikJWTAuthenticationBundle 3.2**
