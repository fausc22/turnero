# Troubleshooting — TuTurno local

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |

---

## CORS error en browser

**Síntoma:** Blocked by CORS  
**Fix:** Verificar origen en `CORS_ORIGINS` backend incluye scheme+host+port exacto. Reiniciar API.

---

## TENANT_NOT_FOUND

**Síntoma:** 404 en API public  
**Fix:** Verificar `x-tenant-slug` header; tenant existe en tuturno_admin; hosts apunta a 127.0.0.1.

---

## Subdominio no resuelve

**Síntoma:** DNS_PROBE_FINISHED_NXDOMAIN  
**Fix:** Agregar entrada `/etc/hosts`. Chrome puede cachear — flush DNS o probar incognito.

---

## Middleware Next no detecta tenant

**Síntoma:** Redirect incorrecto  
**Fix:** Acceder con `peluqueria-naz.localhost:4010` no `localhost:4010`. Revisar middleware extract slug.

---

## MySQL access denied

**Fix:** DB_USER/DB_PASSWORD en .env; crear usuario grants en tuturno_admin y tuturno_*.

---

## Provisioning failed

**Fix:** Ver `tenant_provisioning_runs.error_message`; permiso CREATE DATABASE; slug ya existe.

---

## Baileys QR no conecta

**Fix:** Eliminar sesión `.baileys/` y re-escanear; un solo worker; no WhatsApp Web abierto en phone.

---

## MP webhook no llega local

**Fix:** Usar ngrok tunnel a :4013 para sandbox; o simular webhook con curl en tests.

---

## SSE no conecta

**Fix:** EventSource no soporta headers — usar `@microsoft/fetch-event-source`; verificar JWT válido.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
