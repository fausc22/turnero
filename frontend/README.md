# Frontend - Sistema de Turnos para Barberías

Frontend desarrollado con Next.js 14+ (App Router), TypeScript, TailwindCSS y shadcn/ui.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

1. Copia el archivo `env.example` a `.env.local`:

```bash
cp env.example .env.local
```

2. Configura la URL de la API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Ejecución

**Desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001` (o el puerto disponible).

**Producción:**
```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
app/
├── (public)/          # Páginas públicas
│   └── [slug]/        # Página de barbería por slug
├── admin/             # Panel de administración
│   ├── layout.tsx     # Layout protegido
│   ├── page.tsx       # Dashboard
│   ├── turnos/        # Gestión de turnos
│   ├── clientes/      # CRUD clientes
│   ├── servicios/     # CRUD servicios
│   └── productos/     # CRUD productos
├── login/             # Página de login
└── layout.tsx         # Layout principal

components/
├── ui/                # Componentes shadcn/ui
└── layout/            # Componentes de layout

context/               # Context API (Auth, Barbería)
hooks/                 # Hooks personalizados
services/api/          # Cliente API con Axios
lib/                   # Utilidades y validaciones
types/                 # Tipos TypeScript compartidos
```

## 🔐 Autenticación

El sistema usa JWT almacenado en localStorage. El cliente API maneja automáticamente:
- Agregar token a las requests
- Refresh token automático
- Redirección a login si no está autenticado

## 📚 Funcionalidades

### Público
- Selección de barbería por slug
- Selección de servicios y productos
- Reserva de turnos
- Checkout con Mercado Pago

### Admin
- Dashboard con métricas
- Gestión de turnos
- CRUD de clientes
- CRUD de servicios
- CRUD de productos
- (Próximamente: horarios, bloqueos, branding)

## 🛠️ Tecnologías

- **Next.js 14+** - Framework React con App Router
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos
- **shadcn/ui** - Componentes UI
- **React Hook Form + Zod** - Formularios y validaciones
- **Axios** - Cliente HTTP
- **Zustand** - Estado global (opcional)
- **Framer Motion** - Animaciones (preparado)

## 📝 Notas

- Todos los tipos están sincronizados con el backend
- Validaciones con Zod en formularios
- Hooks personalizados para cada entidad
- Context API para estado global (auth, barbería)
- Diseño responsive y moderno

