# Definition of Done — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [BACKLOG.md](./BACKLOG.md) |
| Bloquea a | Criterios cierre tareas |

---

## Por tarea (BACKLOG)

Una tarea está **HECHA** cuando:

1. Código implementado según doc referenciada
2. Sin errores TypeScript (`tsc --noEmit`)
3. Lint pasa en archivos tocados
4. Criterio de aceptación del BACKLOG verificado manualmente
5. `docs/STATUS.md` actualizado si aplica módulo
6. Checkbox marcado en BACKLOG.md

---

## Por endpoint backend

- Validación Zod en body/query
- AppError con code documentado
- Test integración mínimo (fase 9+)
- Documentado en ENDPOINTS.md si cambió contrato

---

## Por pantalla frontend

- Responsive mobile + desktop
- Loading, empty, error states
- Dark theme tokens aplicados
- Copy según COPY-AND-TONE.md

---

## Por fase

| Fase | Done cuando |
|------|-------------|
| 0 | 4 apps arrancan; hosts OK; admin BD existe |
| 1 | Crear tenant + login gerente |
| 2 | POST reserva sin auth funciona |
| 3 | Flujo cliente 5 pasos E2E manual |
| 4 | Agenda + CRUD edit funcional |
| 5 | MP sandbox pago exitoso |
| 6 | WhatsApp + email confirmación |
| 7 | Stats + branding preview |
| 8 | Roles restringen API + UI |
| 9 | Jest + Playwright verdes |
| 10 | QA-CHECKLIST-LOCAL 100% |

---

## Proyecto completo (local)

- Todas tareas BACKLOG checked
- STATUS.md sin PENDIENTE en módulos core
- QA checklist completo
- 2 tenants demo operativos
- Documentación al día

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
