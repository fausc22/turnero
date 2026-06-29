# Variables de entorno — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Bloquea a | .env.example por app |

---

## backend/.env

```env
NODE_ENV=development
PORT=4013

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_ADMIN_NAME=tuturno_admin

JWT_SECRET=dev-jwt-change-me-min-32-chars!!
JWT_REFRESH_SECRET=dev-refresh-change-me-min-32!!
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

SUPER_JWT_SECRET=dev-super-jwt-change-me-min-32!!!
SUPER_JWT_EXPIRES_IN=8h

RESERVATION_TOKEN_SECRET=dev-reservation-token-secret!!

CORS_ORIGINS=http://panel.localhost:4011,http://admin.localhost:4012,http://peluqueria-naz.localhost:4010,http://estetica-luna.localhost:4010

API_PUBLIC_URL=http://api.localhost:4013
CLIENT_BASE_HOST=localhost:4010

MP_WEBHOOK_SECRET=optional-dev

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
SMTP_FROM=TuTurno <noreply@tuturno.local>

DEV_UNLIMITED=true

OPENCAGE_API_KEY=optional
```

---

## frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://api.localhost:4013
NEXT_PUBLIC_CLIENT_PORT=4010
```

---

## panel/.env.local

```env
NEXT_PUBLIC_API_URL=http://api.localhost:4013
NEXT_PUBLIC_APP_URL=http://panel.localhost:4011
```

---

## panel-super/.env.local

```env
NEXT_PUBLIC_API_URL=http://api.localhost:4013
NEXT_PUBLIC_APP_URL=http://admin.localhost:4012
```

---

## Mercado Pago (tenant)

Configurado por local en panel → `politicas_reserva.mp_access_token`, no env global.

---

## Producción futuro

Placeholder `{BASE_DOMAIN}` en CLIENT_BASE_HOST y CORS.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
