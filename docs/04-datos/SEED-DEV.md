# Seed desarrollo — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [12-dev-local/SETUP.md](../12-dev-local/SETUP.md) |
| Bloquea a | seed_dev.sql, scripts |

---

## Super admin

| Campo | Valor |
|-------|-------|
| email | super@tuturno.local |
| password | SuperAdmin123! |
| BD | tuturno_admin.super_usuarios |

---

## Tenant 1: peluqueria-naz

| Campo | Valor |
|-------|-------|
| slug | peluqueria-naz |
| subdominio dev | peluqueria-naz.localhost:4010 |
| BD | tuturno_peluqueria_naz |
| plan | profesional |
| page_status | ACTIVA |

**Gerente:** admin@nazareno.local / Password123!

**Profesionales:** Juan (barbas), Martín (color)

**Servicios:** Corte ($8000, 30min), Barba ($5000, 20min), Corte+Barba ($12000, 45min)

**Horarios:** Lun-Sáb 9:00-19:00

**Turnos demo:** 3 turnos confirmados próximos 7 días

---

## Tenant 2: estetica-luna

| Campo | Valor |
|-------|-------|
| slug | estetica-luna |
| subdominio | estetica-luna.localhost:4010 |
| BD | tuturno_estetica_luna |
| plan | trial (trial_ends_at +14d) |

**Gerente:** luna@estetica.local / Password123!

**Servicios:** Manicura, Pedicura, Depilación

**page_status:** ACTIVA

---

## Mercado Pago sandbox

Documentar en `.env` placeholders; no commitear tokens reales.

---

## WhatsApp dev

Baileys: sesión en `backend/.wwebjs_auth/` o equivalente; QR al primer arranque worker.

---

## Comando

```bash
npm run setup:db
# Ejecuta setup admin + provision 2 tenants + seed
```

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
