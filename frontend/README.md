# Frontend — Luxury Cars

Aplicación web SPA (Single Page Application) desarrollada con **React 19**, **TypeScript** y **Vite** para la gestión integral de un concesionario de vehículos de lujo. Incluye catálogo público, sistema de reservas, mensajería, panel de administración y autenticación basada en JWT.

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Rutas de la Aplicación](#rutas-de-la-aplicación)
- [Módulos Principales](#módulos-principales)
  - [Autenticación y Autorización](#autenticación-y-autorización)
  - [Gestión de Estado — Context API](#gestión-de-estado--context-api)
  - [Capa de Servicios](#capa-de-servicios)
  - [Hooks Personalizados](#hooks-personalizados)
  - [Sistema de Chat](#sistema-de-chat)
  - [Sistema de Reservas](#sistema-de-reservas)
- [Despliegue](#despliegue)
- [Troubleshooting](#troubleshooting)

---

## Stack Tecnológico

| Tecnología | Versión | Por qué se eligió |
|---|---|---|
| **React** | 19.2 | Librería UI con modelo declarativo basado en componentes. La versión 19 introduce mejoras de rendimiento con el nuevo compilador |
| **TypeScript** | 5.9 | Tipado estático que reduce bugs en tiempo de compilación y mejora la experiencia de desarrollo en un proyecto con múltiples entidades (vehículos, reservas, usuarios…) |
| **Vite** | 7.2 | Build tool moderno con HMR ultrarrápido. Mucho más ágil que Create React App para iteración durante el desarrollo |
| **React Router** | 7.12 | Enrutamiento del lado del cliente. Soporta rutas anidadas y layouts, lo que facilita separar la zona pública del panel de administración |
| **Tailwind CSS** | 4.1 | Framework utility-first que permite diseñar directamente en JSX sin saltar entre archivos CSS. Ideal para proyectos donde el diseño evoluciona rápido |
| **Axios** | 1.13 | Cliente HTTP con soporte nativo para interceptores, lo que permite inyectar el token JWT de forma centralizada en todas las peticiones |
| **jwt-decode** | 4.0 | Decodificación del token JWT en el cliente para extraer datos del usuario (rol, nombre, id) sin necesidad de una petición adicional al backend |
| **React DatePicker** | 9.1 | Selector de fechas con soporte para rangos y fechas deshabilitadas, necesario para el sistema de reservas |
| **Lucide React** | 0.563 | Librería de iconos SVG tree-shakeable; sólo se incluyen en el bundle los iconos realmente usados |
| **date-fns** | 4.1 | Manipulación de fechas modular y ligera, sin necesidad de cargar toda la librería (a diferencia de moment.js) |
| **clsx / tailwind-merge** | — | Utilidades para combinar clases de Tailwind de forma condicional y sin duplicados |

---

## Arquitectura

El frontend sigue una **arquitectura MVC adaptada al paradigma de React**, con separación clara de responsabilidades entre las distintas capas:

```
┌─────────────────────────────────────────────────────────────────┐
│                         VISTA (View)                            │
│          pages/  ·  components/  ·  layouts/                    │
│   Componentes React puramente visuales y de interacción         │
└────────────────────────────┬────────────────────────────────────┘
                             │ usa
┌────────────────────────────▼────────────────────────────────────┐
│                     CONTROLADOR (Controller)                     │
│                           hooks/                                 │
│   Lógica de negocio UI: filtros, paginación, estado local,      │
│   llamadas a servicios y transformación de datos                 │
└──────────────┬───────────────────────────┬──────────────────────┘
               │ usa                       │ usa
┌──────────────▼──────────┐   ┌───────────▼──────────────────────┐
│       MODELO (Model)    │   │         ESTADO GLOBAL            │
│        services/        │   │           context/               │
│  Llamadas HTTP al API.  │   │  AuthContext · FavoriteContext   │
│  Una función = un       │   │  ChatContext                     │
│  endpoint REST          │   │  Compartido via React Context    │
└──────────────┬──────────┘   └──────────────────────────────────┘
               │
┌──────────────▼──────────┐
│     CLIENTE HTTP        │
│      api/axios.ts       │
│  Instancia Axios con    │
│  interceptor JWT        │
└─────────────────────────┘
```

### Decisiones arquitectónicas relevantes

**¿Por qué Context API y no Redux?**
El estado global de esta aplicación se reduce a tres dominios: sesión del usuario, favoritos y contador de mensajes no leídos. Redux añadiría boilerplate innecesario para un volumen de estado tan acotado. Context API junto con hooks proporciona la misma reactividad sin dependencias extra.

**¿Por qué una capa de servicios separada?**
Centralizar todas las llamadas HTTP en `services/` desacopla los componentes de la implementación del API. Si el backend cambia un endpoint, sólo hay que modificar un fichero de servicio, no rastrear todas las vistas que lo usan.

**¿Por qué hooks personalizados como "controladores"?**
Mover la lógica de negocio de los componentes a hooks (`useCatalog`, `useMyReservations`, etc.) hace que las páginas sean declarativas y fáciles de leer, y que la lógica sea reutilizable y testeable de forma independiente.

**¿Por qué dos layouts (`PublicLayout` / `AdminLayout`)?**
La zona pública y el panel de administración tienen estructuras HTML, navegación y estilos completamente distintos. Encapsularlos en layouts propios evita condicionales en los componentes de página y hace el enrutamiento más legible.

---

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.ts                  # Instancia de Axios + interceptor JWT
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx             # Formulario de inicio de sesión
│   │   │   └── Register.tsx          # Formulario de registro
│   │   ├── public/
│   │   │   ├── VehicleCard.tsx       # Tarjeta de vehículo en el catálogo
│   │   │   ├── Filter.tsx            # Sidebar de filtros del catálogo
│   │   │   ├── FavCard.tsx           # Tarjeta de vehículo favorito
│   │   │   ├── ContactModal.tsx      # Modal para contactar por un vehículo
│   │   │   └── SpecItem.tsx          # Elemento de especificación técnica
│   │   └── ui/
│   │       ├── Header.tsx            # Cabecera de navegación principal
│   │       ├── Footer.tsx            # Pie de página
│   │       └── StatCard.tsx          # Tarjeta de estadística para el dashboard
│   │
│   ├── constants/
│   │   └── reservationStatus.tsx     # Configuración de estados de reserva (etiqueta, color, icono)
│   │
│   ├── context/
│   │   ├── AuthContext.tsx           # Estado global de autenticación
│   │   ├── FavoriteContext.tsx       # Estado global de vehículos favoritos
│   │   └── ChatContext.tsx           # Estado global de mensajes no leídos
│   │
│   ├── helpers/
│   │   ├── ProtectedRoute.tsx        # Guard de ruta: redirige si no es admin
│   │   ├── ConfirmModal.tsx          # Modal de confirmación reutilizable
│   │   └── Toast.tsx                 # Notificaciones tipo toast
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Acceso tipado a AuthContext
│   │   ├── useCatalog.ts             # Filtrado, ordenación y paginación del catálogo
│   │   ├── useChat.ts                # Acceso tipado a ChatContext
│   │   ├── useChatNotification.ts    # Wrapper para el contador de no leídos
│   │   ├── useFavorite.ts            # Acceso tipado a FavoriteContext
│   │   ├── useAdminReservations.ts   # Fetch y gestión de reservas (admin)
│   │   └── useMyReservations.ts      # Fetch de reservas del usuario autenticado
│   │
│   ├── layouts/
│   │   ├── PublicLayout.tsx          # Layout para páginas públicas (Header + Footer)
│   │   └── AdminLayout.tsx           # Layout para el panel de administración
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── Catalog.tsx           # Componente de catálogo genérico (venta y alquiler)
│   │   │   ├── Rent.tsx              # Catálogo en modo RENT
│   │   │   ├── Sold.tsx              # Catálogo en modo SALE
│   │   │   ├── VehicleDetail.tsx     # Detalle de vehículo + reserva
│   │   │   ├── Chat.tsx              # Interfaz de mensajería para el usuario
│   │   │   ├── MyReservations.tsx    # Mis reservas (usuario autenticado)
│   │   │   └── UserProfilePanel.tsx  # Perfil y ajustes del usuario
│   │   └── admin/
│   │       ├── Dashboard.tsx         # Panel de control con estadísticas
│   │       ├── VehicleList.tsx       # Inventario de vehículos
│   │       ├── VehicleForm.tsx       # Formulario de creación/edición de vehículo
│   │       ├── UserManagement.tsx    # CRUD de usuarios
│   │       ├── BrandManagement.tsx   # CRUD de marcas
│   │       ├── ColorManagement.tsx   # CRUD de colores
│   │       ├── ModelManagement.tsx   # CRUD de modelos
│   │       ├── ProvinceManagement.tsx # CRUD de provincias/ciudades
│   │       └── AdminReservations.tsx # Gestión de todas las reservas
│   │
│   ├── services/
│   │   ├── authService.ts            # Login y registro
│   │   ├── vehicleService.ts         # CRUD de vehículos e imágenes
│   │   ├── reservationService.ts     # Crear, listar y actualizar reservas
│   │   ├── conversationService.ts    # Conversaciones y mensajes del chat
│   │   ├── userService.ts            # Gestión de usuarios
│   │   ├── favoriteService.ts        # Favoritos del usuario
│   │   ├── brandService.ts           # CRUD de marcas
│   │   ├── colorService.ts           # CRUD de colores
│   │   └── provinceService.ts        # CRUD de provincias
│   │
│   ├── types/
│   │   ├── auth.ts                   # Tipos de autenticación (User, JWTPayload, RegisterData…)
│   │   ├── vehicle.ts                # Entidad Vehicle y VehicleFormData
│   │   ├── reservation.ts            # Entidad Reservation
│   │   ├── message.ts                # Entidades Conversation y Message
│   │   ├── brand.ts                  # Entidad Brand
│   │   ├── color.ts                  # Entidad Color
│   │   ├── filters.ts                # FilterState para el catálogo
│   │   ├── provinces.ts              # Entidad Province
│   │   └── dashboard.ts              # Tipos para las estadísticas del dashboard
│   │
│   ├── utils/
│   │   ├── formatters.ts             # Formateo de precios, fechas y monedas
│   │   └── vehicleImages.ts          # Construcción de URLs de imágenes de vehículos
│   │
│   ├── App.tsx                       # Árbol de rutas principal
│   ├── main.tsx                      # Punto de entrada; composición de providers
│   └── index.css                     # Estilos globales, imports de Tailwind y clases utilitarias compartidas
│
├── .env.example                      # Plantilla de variables de entorno
├── Dockerfile                        # Imagen Docker multi-stage (build + nginx)
├── nginx.conf                        # Configuración de Nginx para SPA + proxy API
├── eslint.config.js                  # Reglas de linting
├── index.html                        # Punto de entrada HTML
├── package.json                      # Dependencias y scripts
├── tsconfig.json                     # Configuración raíz de TypeScript (referencias)
├── tsconfig.app.json                 # Configuración TypeScript para el código de la app
├── tsconfig.node.json                # Configuración TypeScript para vite.config.ts
└── vite.config.ts                    # Configuración de Vite (proxy dev, plugins)
```

---

## Requisitos Previos

- **Node.js** >= 18.0
- **npm** >= 9.0
- **Backend API** corriendo y accesible (ver [README del backend](../backend/README.md))

---

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd ProyectoFinGrado/frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con la URL de tu backend (ver sección [Variables de Entorno](#variables-de-entorno)).

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

> **Nota sobre el proxy**: En modo desarrollo, Vite actúa como proxy. Las peticiones a `/api/*` y `/images/*` se redirigen automáticamente al backend (`http://127.0.0.1:8000`), por lo que no es necesario configurar CORS durante el desarrollo.

---

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_BACKEND_URL` | URL base del backend, usada para construir las URLs absolutas de las imágenes de vehículos | `http://localhost:8000` |

> Las variables en Vite **deben** tener el prefijo `VITE_` para ser accesibles en el código del cliente mediante `import.meta.env.VITE_*`.

**Ejemplo de `.env` para desarrollo:**

```env
VITE_BACKEND_URL=http://localhost:8000
```

**Ejemplo de `.env` para producción:**

```env
VITE_BACKEND_URL=https://api.luxurycars.example.com
```

---

## Scripts Disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:5173` con HMR |
| `npm run build` | Compila TypeScript y genera el build de producción en `/dist` |
| `npm run preview` | Sirve localmente el build de `/dist` para verificar antes de desplegar |
| `npm run lint` | Ejecuta ESLint sobre el código fuente |

---

## Rutas de la Aplicación

### Rutas públicas (`PublicLayout`)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Home` | Landing page con vehículos destacados y secciones de servicios |
| `/venta` | `Sold` | Catálogo de vehículos en venta con filtros avanzados |
| `/alquiler` | `Rent` | Catálogo de vehículos de alquiler con filtros avanzados |
| `/vehiculo/:id` | `VehicleDetail` | Detalle de un vehículo: especificaciones, galería y formulario de reserva |
| `/mis-chats` | `Chat` | Sistema de mensajería del usuario con el concesionario |
| `/mis-reservas` | `MyReservations` | Reservas activas e historial del usuario autenticado |
| `/login` | `Login` | Formulario de inicio de sesión |
| `/register` | `Register` | Formulario de registro de nueva cuenta |
| `*` | — | Redirige a `/` (catch-all) |

### Rutas de administración (`AdminLayout` + `ProtectedRoute`)

Requieren autenticación activa con rol `ROLE_ADMIN` o `ROLE_SALES`.

| Ruta | Componente | Descripción |
|---|---|---|
| `/admin` | `Dashboard` | Panel de control: estadísticas, estado de flota y actividad reciente |
| `/admin/coches` | `VehicleList` | Inventario completo de vehículos con búsqueda, edición y baja |
| `/admin/coches/nuevo` | `VehicleForm` | Formulario para añadir un nuevo vehículo con imágenes |
| `/admin/coches/editar/:id` | `VehicleForm` | Formulario de edición de vehículo existente |
| `/admin/mensajes` | `Chat` | Gestión de todas las conversaciones con clientes |
| `/admin/reservas` | `AdminReservations` | Gestión de reservas: aprobar, rechazar o cancelar |
| `/admin/usuarios` | `UserManagement` | CRUD de usuarios y asignación de roles |
| `/admin/marcas` | `BrandManagement` | CRUD de marcas de vehículos |
| `/admin/modelos` | `ModelManagement` | CRUD de modelos vinculados a marcas |
| `/admin/colores` | `ColorManagement` | CRUD de colores con selector hexadecimal |
| `/admin/ciudades` | `ProvinceManagement` | CRUD de provincias/ciudades disponibles |

---

## Módulos Principales

### Autenticación y Autorización

El sistema de autenticación utiliza **JWT (JSON Web Tokens)** emitidos por el backend.

**Flujo de login:**

```
Usuario → POST /login_check → Backend emite JWT
→ Token guardado en localStorage
→ jwtDecode() extrae: id, email, roles, nombre, teléfono, expiración
→ AuthContext actualiza el estado global
→ Redirección: /admin (si admin) o / (si cliente)
```

**Estructura del token decodificado:**

```typescript
interface JWTPayload {
  username: string;   // email del usuario
  roles: string[];    // ej. ["ROLE_ADMIN", "ROLE_USER"]
  exp: number;        // timestamp de expiración
  id?: number;
  name?: string;
  phone?: string;
}
```

**Inyección automática del token** (`api/axios.ts`):

Todas las peticiones HTTP pasan por un interceptor de Axios que añade la cabecera `Authorization: Bearer <token>` de forma transparente, sin que cada servicio deba gestionarlo manualmente.

**Control de acceso por roles:**

El componente `ProtectedRoute` envuelve todas las rutas de `/admin`. Si el usuario no está autenticado o no tiene rol de administrador, es redirigido automáticamente.

---

### Gestión de Estado — Context API

La aplicación gestiona tres dominios de estado global mediante Context API. Se eligió este enfoque sobre Redux por la simplicidad y el volumen de estado manejado.

#### `AuthContext`

Gestiona la sesión del usuario en toda la aplicación.

| Estado / Función | Tipo | Descripción |
|---|---|---|
| `user` | `User \| null` | Datos del usuario autenticado (decodificados del JWT) |
| `token` | `string \| null` | Token JWT crudo (persistido en `localStorage`) |
| `isAuthenticated` | `boolean` | `true` si hay usuario activo |
| `isAdmin` | `boolean` | `true` si el usuario tiene `ROLE_ADMIN` o `ROLE_SALES` |
| `login(token)` | función | Guarda el token y decodifica el usuario |
| `logout()` | función | Limpia token y estado; redirige al inicio |
| `updateUser(fields)` | función | Actualización parcial (nombre, teléfono) sin re-login |

#### `FavoriteContext`

Gestiona la lista de vehículos favoritos del usuario.

- Carga los favoritos al montar el árbol de providers.
- `toggleFavorite()` aplica **actualización optimista**: el cambio se refleja en la UI inmediatamente y se revierte sólo si el servidor devuelve error.
- `isFavorite(vehicleIri)` permite a cualquier componente consultar el estado sin petición adicional.

#### `ChatContext`

Mantiene el contador de mensajes no leídos visible en la cabecera.

- **Polling cada 10 segundos** hacia el endpoint de conversaciones.
- Diferencia el comportamiento según el rol: el personal del concesionario ve los mensajes nuevos de clientes; los clientes ven las respuestas del admin.
- `refreshUnreadCount()` permite forzar una actualización manual (por ejemplo, al enviar un mensaje).

**Composición de providers en `main.tsx`:**

```tsx
<AuthProvider>
  <BrowserRouter>
    <ChatProvider>
      <FavoriteProvider>
        <App />
      </FavoriteProvider>
    </ChatProvider>
  </BrowserRouter>
</AuthProvider>
```

El orden importa: `ChatProvider` y `FavoriteProvider` necesitan acceso a `AuthContext`, por lo que se anidan dentro de `AuthProvider`.

---

### Capa de Servicios

Cada fichero en `services/` encapsula todas las llamadas HTTP a un recurso del API. Ningún componente o hook llama directamente a Axios; toda la comunicación con el backend pasa por esta capa.

```
components / pages
      │
      ▼ (a través de hooks)
   services/
      │
      ▼
   api/axios.ts  →  Backend REST API
```

**Ejemplo — `vehicleService.ts`:**

| Función | Método | Endpoint |
|---|---|---|
| `getVehicleDetail(id)` | GET | `/vehicles/{id}` |
| `getAllVehicles()` | GET | `/vehicles` (paginado, recorre todas las páginas) |
| `getFeaturedVehicles()` | GET | `/vehicles?featured=true` |
| `createVehicle(payload)` | POST | `/vehicles` |
| `updateVehicle(id, payload)` | PATCH | `/vehicles/{id}` (JSON Merge Patch) |
| `archiveVehicle(id)` | PATCH | `/vehicles/{id}` (status = "DELETED") |
| `uploadVehicleImage(file, isMain)` | POST | `/vehicle_images` (multipart) |

El backend usa **API Platform** con formato **Hydra/JSON-LD**. Los servicios gestionan la paginación de `HydraResponse<T>` y la extracción de los arrays `hydra:member`.

---

### Hooks Personalizados

Los hooks actúan como la capa de controlador: coordinan servicios, estado local y lógica de presentación.

#### `useCatalog(mode: "SALE" | "RENT")`

El hook más completo de la aplicación. Gestiona:

- Carga inicial de vehículos y opciones de filtro.
- Aplicación de hasta 8 filtros simultáneos (marca, combustible, cambio, precio mín/máx, año mín/máx, provincia, color, carrocería).
- Ordenación por precio, año o fecha de alta (ascendente/descendente).
- **Paginación cliente-side** con 12 vehículos por página.
- Handlers listos para conectar directamente a los `onChange` de los inputs del componente `Filter`.

#### `useMyReservations()`

Obtiene las reservas del usuario autenticado. Depende de `AuthContext` para obtener el ID de usuario.

#### `useAdminReservations()`

Obtiene todas las reservas del sistema. Sólo accesible desde rutas protegidas de administrador.

#### `useAuth()`, `useFavorite()`, `useChat()`

Wrappers tipados sobre sus respectivos contextos. Lanzan un error descriptivo si se usan fuera del árbol de providers, facilitando el debugging.

---

### Sistema de Chat

El módulo de mensajería permite la comunicación directa entre clientes y el personal del concesionario, tanto para consultas sobre vehículos en venta como para el seguimiento de reservas de alquiler.

**Entidades involucradas:**

```
Conversation
  ├── contactName, contactEmail, contactPhone
  ├── vehicle?          (vehículo relacionado)
  ├── reservation?      (reserva relacionada)
  ├── status            (NEW, NEW_FROM_CLIENT, NEW_FROM_ADMIN, READ…)
  └── messages[]
        ├── content
        ├── isAdmin     (distingue quién escribió)
        └── createdAt
```

**Flujo:**

1. Un visitante (autenticado o no) abre el `ContactModal` en la página de detalle de un vehículo.
2. Se crea una `Conversation` vinculada al vehículo.
3. La cabecera del admin muestra el contador de mensajes sin leer que se actualiza cada 10 segundos.
4. Desde `/admin/mensajes`, el personal responde. El estado de la conversación cambia de `NEW_FROM_CLIENT` a `NEW_FROM_ADMIN`.
5. El cliente ve la respuesta en `/mis-chats`.

---

### Sistema de Reservas

Sólo disponible para vehículos de tipo `RENT`. Accesible desde la página de detalle del vehículo.

**Flujo de reserva:**

1. El cliente selecciona un rango de fechas en el calendario interactivo (`react-datepicker`).
2. Las fechas ya ocupadas por reservas confirmadas se muestran como deshabilitadas (obtenidas de `reservationService.getVehicleReservations()`).
3. El precio total se calcula automáticamente: `días × precio diario`.
4. Al confirmar, se crea la reserva con estado `PENDING`.
5. El administrador aprueba o rechaza desde `/admin/reservas`.
6. Los posibles estados son: `PENDING → CONFIRMED | REJECTED | CANCELLED`.

---

## Despliegue

### Docker (recomendado)

El `Dockerfile` usa una estrategia **multi-stage build** que minimiza el tamaño de la imagen final:

- **Stage 1 (`builder`)**: imagen `node:20-alpine` que instala dependencias y ejecuta `npm run build`. Las variables de entorno `VITE_API_URL` y `VITE_BACKEND_URL` se inyectan en tiempo de build como `ARG`.
- **Stage 2 (`serve`)**: imagen `nginx:alpine` que sirve el directorio `/dist` generado en el stage anterior. No incluye Node.js ni el código fuente.

```bash
docker build \
  --build-arg VITE_BACKEND_URL=https://api.luxurycars.example.com \
  -t luxury-cars-frontend .

docker run -p 80:80 luxury-cars-frontend
```

**Configuración de Nginx (`nginx.conf`):**

- `try_files $uri $uri/ /index.html` — resuelve el problema habitual de SPA donde el servidor desconoce las rutas de React Router y devolvería 404.
- Proxy reverso `/api/` → `http://backend:80/api/` — en producción, el contenedor de nginx redirige las peticiones al API al servicio de backend sin exponer su puerto directamente.
- Cache agresiva (`expires 1y; immutable`) para assets estáticos con hash en el nombre (JS, CSS, imágenes), lo que maximiza el rendimiento de carga.

### Build manual + servidor estático

```bash
npm run build
# Los archivos listos para producción quedan en /dist
```

Configuración mínima de Nginx para servir el build:

```nginx
server {
    listen 80;
    root /var/www/luxury-cars;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Troubleshooting

### Error "Network Error" o peticiones fallidas

**Causa probable**: el backend no está corriendo o la URL es incorrecta.

1. Verifica que el backend responde en `http://localhost:8000`.
2. Comprueba `VITE_BACKEND_URL` en `.env`.
3. En desarrollo, el proxy de Vite (`vite.config.ts`) redirige `/api` al backend automáticamente; no se necesita CORS.

---

### Error CORS en producción

**Causa**: el frontend hace peticiones directas al backend sin pasar por el proxy de Nginx.

**Solución**: asegúrate de que en producción las peticiones `/api/*` pasan por el bloque `proxy_pass` de `nginx.conf`, o configura el backend con `nelmio_cors` para aceptar el origen del frontend:

```yaml
# config/packages/nelmio_cors.yaml
nelmio_cors:
  defaults:
    allow_origin: ["https://luxurycars.example.com"]
    allow_methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    allow_headers: ["Content-Type", "Authorization"]
```

---

### Las imágenes de vehículos no se muestran

**Causa**: `VITE_BACKEND_URL` no está definida o apunta a la URL incorrecta.

Las URLs de imágenes se construyen en `utils/vehicleImages.ts` concatenando `VITE_BACKEND_URL` con la ruta relativa devuelta por el backend. Verifica el valor de la variable:

```typescript
// utils/vehicleImages.ts
export function buildImageUrl(path: string): string {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_BACKEND_URL}${path}`;
}
```

---

### Módulo no encontrado tras instalar dependencias

**Causa**: caché corrupta de `node_modules`.

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### El HMR (hot reload) no funciona

```bash
rm -rf node_modules/.vite
npm run dev
```

---

### Token JWT expirado — la sesión no se renueva

La aplicación no implementa refresh token. Al expirar el JWT, el usuario debe volver a autenticarse. El `AuthContext` detecta la expiración al decodificar el token y limpia la sesión automáticamente. Si las peticiones empiezan a devolver 401, comprueba la expiración del token en `localStorage`:

```javascript
// En la consola del navegador
const payload = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
console.log("Expira:", new Date(payload.exp * 1000));
```

---

Desarrollado por **Sergio Ramírez Morón** — Proyecto de Fin de Grado.
