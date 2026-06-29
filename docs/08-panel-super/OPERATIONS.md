# Super panel — Operaciones

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [04-datos/SEED-DEV.md](../04-datos/SEED-DEV.md) |
| Bloquea a | Operación manual SaaS |

---

## Alta de nuevo local (checklist)

1. Login admin.localhost
2. Tenants → Nuevo
3. Completar slug (verificar subdominio no reservado)
4. Esperar provisioning success
5. Comunicar credenciales gerente
6. Gerente completa wizard panel
7. Verificar reserva test en `{slug}.localhost`

---

## Suspender local moroso

1. Tenants → Editar → status suspendido
2. Verificar API retorna TENANT_SUSPENDED
3. page_status opcional BLOQUEADA

---

## Trial por vencer

Job diario lista trials < 3 días → email super admin (futuro)

Manual: filtrar plan=trial en tabla

---

## Reprovision error

1. Ver error_message en provisioning_runs
2. Corregir causa (BD exists, SQL error)
3. Reprovision button

---

## Backup tenant

Ver [13-produccion/BACKUP-RESTORE.md](../13-produccion/BACKUP-RESTORE.md)

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
