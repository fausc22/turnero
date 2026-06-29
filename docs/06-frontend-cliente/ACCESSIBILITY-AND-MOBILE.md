# Frontend cliente — Mobile y accesibilidad

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [09-ui-ux/DESIGN-SYSTEM.md](../09-ui-ux/DESIGN-SYSTEM.md) |
| Bloquea a | CSS, componentes |

---

## Mobile-first

- Viewport min 320px
- Touch targets min 44x44px
- Sticky footer no tapa contenido (padding-bottom)
- Date strip swipe horizontal

---

## Accesibilidad

- Contraste WCAG AA en dark theme
- Focus visible en todos interactivos
- labels asociados a inputs
- aria-live en confirmación éxito
- Reduced motion: respetar `prefers-reduced-motion` (desactivar Framer)

---

## Performance

- Images next/image para logo/hero
- Lazy load paso 2+ del wizard
- Prefetch servicios en landing

---

## PWA (opcional fase 10)

manifest.json + icons tenant favicon

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
