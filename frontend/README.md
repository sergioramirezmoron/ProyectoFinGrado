# Frontend - Luxury Cars

Aplicación web desarrollada con **React 19**, **TypeScript** y **Vite** para la gestión de vehículos, sistema de reservas, favoritos y chat en tiempo real.

---

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Características Principales](#-características-principales)
- [Rutas de la Aplicación](#-rutas-de-la-aplicación)
- [Integración con el Backend](#-integración-con-el-backend)
- [Despliegue](#-despliegue)
- [Troubleshooting](#-troubleshooting)

---

## 🛠️ Stack Tecnológico

| Tecnología           | Versión | Propósito                    |
| -------------------- | ------- | ---------------------------- |
| **React**            | 19.2    | Librería UI                  |
| **TypeScript**       | 5.9     | Tipado estático              |
| **Vite**             | 7.2     | Build tool y dev server      |
| **React Router**     | 7.12    | Enrutamiento SPA             |
| **Tailwind CSS**     | 4.1     | Framework CSS utility-first  |
| **Axios**            | 1.13    | Cliente HTTP para API        |
| **Lucide React**     | 0.563   | Iconos SVG                   |
| **React DatePicker** | 9.1     | Selector de fechas           |
| **jwt-decode**       | 4.0     | Decodificación de tokens JWT |

---

## ✅ Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** >= 18.0
- **npm** >= 9.0
- **Backend API** corriendo en `http://localhost:3000`

---

## 📦 Instalación

### 1️⃣ Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd frontend
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Copiar archivo de variables de entorno

```bash
cp .env.example .env
```

---

## ⚙️ Configuración

### 📝 Variables de entorno (.env)

Edita el archivo `.env` con la URL de tu backend:

```env
VITE_BACKEND_URL=http://localhost:3000
```

> **Importante**: Las variables de entorno en Vite deben comenzar con el prefijo `VITE_` para ser accesibles en el cliente.

### Ejemplo de configuración para producción

```env
VITE_BACKEND_URL=https://api.luxurycars.com
```

---

## 🚀 Scripts Disponibles

### Modo desarrollo

Inicia el servidor de desarrollo en `http://localhost:5173`:

```bash
npm run dev
```

### Build de producción

Genera los archivos optimizados en la carpeta `/dist`:

```bash
npm run build
```

### Previsualizar build

Previsualiza la versión de producción localmente:

```bash
npm run preview
```

---

## 📁 Estructura del Proyecto

```
frontend/
├── public/                    # Archivos estáticos públicos
├── src/
│   ├── api/                  # Configuración de Axios y endpoints
│   │   └── axios.ts          # Instancia configurada de Axios
│   ├── assets/               # Imágenes, fuentes, archivos estáticos
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/              # Componentes de UI (Buttons, Cards, etc.)
│   │   ├── layout/          # Layouts (Header, Footer, Sidebar)
│   │   ├── auth/          # Autenticación (Login, Register)
│   ├── context/              # Contextos de React
│   │   ├── AuthContext.tsx  # Contexto de autenticación
│   │   └── ...
│   ├── helpers/              # Funciones helper y utilidades
│   │   ├── Toast.tsx        # Notificaciones
│   │   ├── ConfirmModal.tsx # Modal de confirmación
│   │   └── ...
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.ts       # Hook de autenticación
│   │   ├── useChatNotification.ts
│   │   └── ...
│   ├── layouts/              # Componentes de layout principales
│   │   ├── PublicLayout.tsx   # Layout principal
│   │   ├── AdminLayout.tsx  # Layout de admin
│   │   └── ...
│   ├── pages/                # Páginas/Vistas de la aplicación
│   │   ├── Home.tsx         # Página principal
│   │   ├── Venta.tsx        # Catálogo de venta
│   │   ├── Alquiler.tsx     # Catálogo de alquiler
│   │   ├── VehiculoDetalle.tsx
│   │   ├── Chat.tsx         # Sistema de mensajería
│   │   ├── Dashboard.tsx    # Panel de administración
│   │   └── ...
│   ├── services/             # Servicios de API
│   │   ├── authService.ts   # Servicios de autenticación
│   │   ├── vehicleService.ts # Servicios de vehículos
│   │   ├── reservation.ts
│   │   ├── conversationService.ts
│   │   └── ...
│   ├── types/                # Definiciones de tipos TypeScript
│   │   ├── auth.ts
│   │   ├── vehicle.ts
│   │   ├── reservation.ts
│   │   ├── message.ts
│   │   └── ...
│   ├── App.tsx               # Componente raíz con rutas
│   ├── main.tsx              # Punto de entrada de la aplicación
│   └── index.css             # Estilos globales y Tailwind
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Archivos ignorados por Git
├── eslint.config.js          # Configuración de ESLint
├── index.html                # HTML principal
├── package.json              # Dependencias y scripts
├── tailwind.config.ts        # Configuración de Tailwind CSS
├── tsconfig.json             # Configuración de TypeScript
└── vite.config.ts            # Configuración de Vite
```

---

## ✨ Características Principales

### 🏠 Landing Page

- Hero section con imágenes de alta calidad
- Carrusel infinito de vehículos destacados
- Secciones de servicios y beneficios
- Diseño responsive y animaciones suaves

### 🚗 Catálogo de Vehículos

- **Venta**: Listado de vehículos disponibles para compra
- **Alquiler**: Sistema de reservas con calendario
- Filtros por marca, modelo, precio y categoría
- Vista detallada con galería de imágenes
- Sistema de búsqueda en tiempo real

### 📅 Sistema de Reservas

- Calendario interactivo con fechas bloqueadas
- Validación de disponibilidad en tiempo real
- Cálculo automático de precios
- Gestión de estado de reservas (Pendiente, Confirmada, Rechazada)

### 💬 Chat en Tiempo Real

- Sistema de mensajería bidireccional
- Notificaciones de mensajes no leídos
- Panel de administración para gestionar conversaciones
- Separación de chats de venta y reservas
- Actualización automática de mensajes (polling cada 10s)

### 🔐 Autenticación

- Login y registro de usuarios
- Autenticación mediante JWT
- Rutas protegidas según roles (Usuario, Admin, Ventas)
- Persistencia de sesión en localStorage

### 🎛️ Panel de Administración

- Dashboard con estadísticas
- Gestión de vehículos (CRUD completo)
- Gestión de ciudades (CRUD completo)
- Gestión de colores (CRUD completo)
- Gestión de marcas (CRUD completo)
- Gestión de modelos (CRUD completo)
- Gestión de reservas y cambio de estado
- Sistema de chat integrado
- Visualización de actividad reciente

---

## 🗺️ Rutas de la Aplicación

### Rutas Públicas

| Ruta            | Componente      | Descripción          |
| --------------- | --------------- | -------------------- |
| `/`             | Home            | Landing page         |
| `/login`        | Login           | Inicio de sesión     |
| `/register`     | Register        | Registro de usuario  |
| `/venta`        | Sold            | Catálogo de venta    |
| `/alquiler`     | Rent            | Catálogo de alquiler |
| `/vehiculo/:id` | VehicleDetail   | Detalle de vehículo  |
| `/mis-chats`    | Chat            | Sistema de mensajería (público) |

### Rutas de Administración (Requieren autenticación con rol Admin/Ventas)

| Ruta                       | Componente          | Descripción                     |
| -------------------------- | ------------------- | ------------------------------- |
| `/admin`                   | Dashboard           | Panel de control principal      |
| `/admin/coches`            | VehicleList         | Listado de vehículos            |
| `/admin/coches/nuevo`      | VehicleForm         | Crear nuevo vehículo            |
| `/admin/coches/editar/:id` | VehicleForm         | Editar vehículo existente       |
| `/admin/mensajes`          | Chat                | Sistema de mensajería (admin)   |
| `/admin/usuarios`          | UserManagement      | Gestión de usuarios             |
| `/admin/colores`           | ColorManagement     | Gestión de colores              |
| `/admin/ciudades`          | ProvinceManagement  | Gestión de ciudades/provincias  |
| `/admin/marcas`            | BrandManagement     | Gestión de marcas               |
| `/admin/modelos`           | ModelManagement     | Gestión de modelos              |

> **Nota**: Todas las rutas bajo `/admin` están protegidas mediante el componente `ProtectedRoute` y requieren autenticación activa.

---

## 🚀 Despliegue

### Build de producción

```bash
npm run build
```

Esto generará una carpeta `/dist` con los archivos optimizados listos para producción.

### Despliegue en Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno:
   - `VITE_BACKEND_URL`: URL de tu API en producción
3. Build command: `npm run build`
4. Publish directory: `dist`

### Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard
3. Vercel detectará automáticamente Vite y configurará el build

### Despliegue manual (Nginx)

Después de ejecutar `npm run build`, copia el contenido de `/dist` a tu servidor web:

```bash
scp -r dist/* usuario@servidor:/var/www/html/
```

Configuración de Nginx:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🐛 Troubleshooting

### Error: "Network Error" al hacer peticiones

**Causa**: El backend no está corriendo o la URL es incorrecta.

**Solución**:

1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Revisa la variable `VITE_BACKEND_URL` en `.env`
3. Comprueba la configuración de CORS en el backend

```env
VITE_BACKEND_URL=http://localhost:3000
```

---

### Error: "Access to fetch has been blocked by CORS policy"

**Causa**: El backend no permite peticiones desde el origen del frontend.

**Solución**: Asegúrate de que el backend tenga configurado CORS correctamente en `config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
  defaults:
    origin_regex: true
    allow_origin: ["^http://localhost:[0-9]+"]
    allow_methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    allow_headers: ["Content-Type", "Authorization"]
```

---

### Error: "Module not found" después de instalar dependencias

**Causa**: Caché corrupto de node_modules.

**Solución**:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Error: "Unexpected token" en producción

**Causa**: Navegador antiguo que no soporta sintaxis moderna de JavaScript.

**Solución**: Configura el target en `vite.config.ts`:

---

### Las imágenes no se cargan en producción

**Causa**: Rutas incorrectas o variable de entorno mal configurada.

**Solución**: Asegúrate de usar siempre:

```typescript
const imageUrl = `${import.meta.env.VITE_BACKEND_URL}/vehicle_images/546435.jpg`;
```

---

### Error: "Token expired" al hacer peticiones

**Causa**: El token JWT ha expirado.

**Solución**: Implementar refresh token o redirigir al login:

---

### El servidor de desarrollo no se actualiza automáticamente

**Causa**: Problema con el hot module replacement (HMR).

**Solución**: Reinicia el servidor de desarrollo:

```bash
# Ctrl+C para detener
npm run dev
```

O limpia la caché de Vite:

```bash
rm -rf node_modules/.vite
npm run dev
```

---

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de React Router](https://reactrouter.com/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/)
- [Documentación de TypeScript](https://www.typescriptlang.org/)

---

**Desarrollado por Sergio Ramírez Morón.**
