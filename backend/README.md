# API REST - Sistema de Turnos para Barberías

API REST desarrollada en Node.js con TypeScript para gestión de turnos en barberías multi-tenant.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

1. Copia el archivo `env.example` a `.env` y configura las variables de entorno:

```bash
cp env.example .env
```

2. Edita el archivo `.env` y configura las siguientes variables:

   - **Base de datos MySQL**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - **JWT**: `JWT_SECRET`, `JWT_REFRESH_SECRET` (⚠️ **IMPORTANTE**: Cambiar por valores seguros en producción)
   - **Mercado Pago**: `MP_ACCESS_TOKEN` (obtener desde el panel de desarrolladores)
   - **CORS**: `CORS_ORIGIN` (URL del frontend)
   - **API URL**: `API_URL` (URL completa de la API para webhooks)

### Ejecución

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── config/          # Configuración (DB, logger)
├── controllers/     # Controladores de las rutas
├── middlewares/     # Middlewares (auth, error handling, validación)
├── repositories/    # Acceso a datos (MySQL)
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
└── utils/           # Utilidades (JWT, password, validaciones)
```

## 🔐 Autenticación

La API usa JWT para autenticación. Incluye:
- Login con email/password
- Refresh tokens
- Middleware de autorización por roles
- Protección multi-tenant

## 📚 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token

### Barberías
- `GET /api/barberias` - Listar barberías
- `GET /api/barberias/:id` - Obtener barbería
- `POST /api/barberias` - Crear barbería (SUPER_ADMIN)
- `PUT /api/barberias/:id` - Actualizar barbería
- `DELETE /api/barberias/:id` - Eliminar barbería

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Servicios
- `GET /api/servicios` - Listar servicios
- `POST /api/servicios` - Crear servicio
- `PUT /api/servicios/:id` - Actualizar servicio
- `DELETE /api/servicios/:id` - Eliminar servicio

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Turnos
- `GET /api/turnos` - Listar turnos
- `POST /api/turnos` - Crear turno
- `PUT /api/turnos/:id` - Actualizar turno
- `DELETE /api/turnos/:id` - Eliminar turno

### Pagos
- `POST /api/pagos/preference` - Crear preferencia de pago (Mercado Pago)
- `POST /api/pagos/webhook` - Webhook de Mercado Pago

## 🛠️ Tecnologías

- **Node.js** + **TypeScript**
- **Express** - Framework web
- **MySQL2** - Base de datos (sin ORM)
- **JWT** - Autenticación
- **Zod** - Validación de esquemas
- **Winston** - Logging
- **bcrypt** - Hash de contraseñas
- **Axios** - Cliente HTTP (Mercado Pago)

## 🔒 Roles

- `SUPER_ADMIN` - Acceso total al sistema
- `ADMIN_BARBERIA` - Administrador de una barbería
- `BARBERO` - Usuario básico

## 📝 Notas

- Todos los endpoints (excepto login) requieren autenticación
- La mayoría de endpoints están protegidos por barbería (multi-tenant)
- Validaciones con Zod en todos los inputs
- Prepared statements en todas las consultas MySQL
- Sistema de auditoría para acciones importantes
- Logs estructurados con Winston

