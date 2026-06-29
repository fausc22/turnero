# Copy y tono — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [01-producto/USER-PERSONAS.md](../01-producto/USER-PERSONAS.md) |
| Bloquea a | Strings UI |

---

## Tono

- Español rioplatense neutro (voseo opcional suave: "Reservá" OK, exceso no)
- Directo, amable, profesional
- Sin jerga técnica hacia cliente final
- Panel: imperativo claro ("Guardar cambios", "Nuevo turno")

---

## Cliente — ejemplos

| Contexto | Copy |
|----------|------|
| CTA landing | Reservar turno |
| Paso servicios | Elegí tus servicios |
| Sin slots | No hay horarios para esta fecha. Probá otro día. |
| Confirmación | ¡Listo! Tu turno quedó confirmado |
| Error slot | Ese horario acaba de ser tomado. Elegí otro. |
| Pago pendiente | Estamos procesando tu pago |

---

## Panel — ejemplos

| Contexto | Copy |
|----------|------|
| Nueva reserva SSE | Nueva reserva de {cliente} |
| Guardar ok | Cambios guardados |
| Eliminar confirm | ¿Cancelar este turno? Esta acción no se puede deshacer. |

---

## WhatsApp plantillas

```
Hola {{cliente_nombre}}! Tu turno en {{local_nombre}} quedó confirmado para el {{fecha}} a las {{hora}}. 
Gestionarlo: {{link_gestion}}
```

---

## Errores usuario

Mensaje humano + code técnico solo en logs, no en UI cliente.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
