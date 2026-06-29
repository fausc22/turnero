# Hosts locales — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [SUBDOMAINS-AND-ROUTING.md](../02-arquitectura/SUBDOMAINS-AND-ROUTING.md) |

---

## /etc/hosts (macOS / Linux)

Agregar:

```
127.0.0.1 api.localhost
127.0.0.1 panel.localhost
127.0.0.1 admin.localhost
127.0.0.1 peluqueria-naz.localhost
127.0.0.1 estetica-luna.localhost
```

Para nuevos tenants demo agregar línea `{slug}.localhost`.

---

## URLs completas dev

| App | URL |
|-----|-----|
| API | http://api.localhost:4013 |
| Panel | http://panel.localhost:4011 |
| Super | http://admin.localhost:4012 |
| Cliente Naz | http://peluqueria-naz.localhost:4010 |
| Cliente Luna | http://estetica-luna.localhost:4010 |

---

## Nota Windows

Editar `C:\Windows\System32\drivers\etc\hosts` como administrador. Mismas entradas.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
