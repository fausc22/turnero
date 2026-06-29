# Setup desarrollo local — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [HOSTS-LOCAL.md](./HOSTS-LOCAL.md), [ENV-VARIABLES.md](./ENV-VARIABLES.md) |
| Bloquea a | Primer arranque dev |

---

## Prerrequisitos

- Node.js >= 20
- MySQL 8
- npm 9+
- PM2 global opcional: `npm i -g pm2`

---

## Pasos

### 1. Clonar / abrir monorepo

```bash
cd /Users/fausmac/code/turnero
```

### 2. Configurar hosts

Ver [HOSTS-LOCAL.md](./HOSTS-LOCAL.md).

### 3. Variables de entorno

Copiar `.env.example` en backend, frontend, panel, panel-super según [ENV-VARIABLES.md](./ENV-VARIABLES.md).

### 4. Instalar dependencias

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../panel && npm install      # tras scaffold fase 0
cd ../panel-super && npm install  # tras scaffold fase 0
```

### 5. Base de datos

```bash
cd backend
npm run setup:admin
npm run seed:dev
```

### 6. Desarrollo

```bash
# Opción A: desde raíz (tras configurar scripts)
npm run dev

# Opción B: terminales separadas
cd backend && npm run dev          # :4013
cd frontend && npm run dev           # :4010
cd panel && npm run dev              # :4011
cd panel-super && npm run dev        # :4012
cd backend && npm run worker:notifications  # fase 6
```

### 7. Verificar

- http://api.localhost:4013/health
- http://panel.localhost:4011
- http://admin.localhost:4012
- http://peluqueria-naz.localhost:4010

---

## Orden desarrollo

Seguir [PHASE-0-SCAFFOLD.md](../11-implementacion/PHASE-0-SCAFFOLD.md) en adelante.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
