# Animaciones — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [DESIGN-PRINCIPLES.md](./DESIGN-PRINCIPLES.md) |
| Bloquea a | Framer Motion usage |

---

## Reglas

| Regla | Valor |
|-------|-------|
| Duración micro | 150ms |
| Duración standard | 200-250ms |
| Duración page | 300ms max |
| Easing | `[0.25, 0.1, 0.25, 1]` (ease-out) |
| Stagger children | 50ms delay |

---

## Patrones

### Page transition
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
/>
```

### List stagger
```tsx
<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.li variants={item} key={i.id} />)}
</motion.ul>
```

### Skeleton shimmer
CSS animation, no Framer (performance)

### Success check
Scale 0.8→1 + opacity en confirmación reserva (300ms once)

---

## Reduced motion

```tsx
const prefersReduced = useReducedMotion();
// skip animations if true
```

---

## Prohibido

- Bounce exagerado
- Animaciones > 400ms en interacciones
- Parallax decorativo
- Loading spinners infinitos sin skeleton

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
