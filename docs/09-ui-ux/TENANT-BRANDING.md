# Branding por tenant — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [02-arquitectura/FILES-AND-MEDIA.md](../02-arquitectura/FILES-AND-MEDIA.md) |
| Bloquea a | personalizacion panel, frontend landing |

---

## Elementos personalizables

| Elemento | Dónde configura | Dónde aplica |
|----------|-----------------|--------------|
| Logo | panel personalización | header cliente |
| Favicon | panel | browser tab |
| Hero image | panel | landing background |
| color_primario | panel color picker | --accent cliente |
| color_acento | panel | links secundarios |
| texto_bienvenida | panel textarea | landing hero text |

---

## Restricciones

- Layout y tipografía **no** cambian por tenant
- Solo tokens CSS override
- Logo max height 48px header
- Hero overlay gradient dark para legibilidad texto

---

## Preview

Panel personalización muestra preview live con iframe o componente `TenantPreview` que recibe estilos draft antes de guardar.

---

## Defaults

Si tenant sin branding: nombre local + accent indigo default + placeholder hero gradient.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
