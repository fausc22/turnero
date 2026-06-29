# Panel — CRM lite

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [04-datos/SCHEMA-TENANT.md](../04-datos/SCHEMA-TENANT.md) |
| Bloquea a | panel/clientes |

---

## Ficha cliente `/clientes/[id]`

- Datos contacto
- Notas internas (textarea, solo staff)
- Tags: VIP, moroso, nuevo (badges editables)
- Historial turnos tabla
- Total gastado
- Última visita
- Puntos membresía

---

## Búsqueda

- Debounce 300ms teléfono/nombre
- Highlight matches

---

## Export

CSV clientes (gerente) — fase 8

---

## Privacidad

Profesional ve notas en turnos propios solamente.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
