# Design system — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [COMPONENT-LIBRARY.md](./COMPONENT-LIBRARY.md) |
| Bloquea a | tailwind config, globals.css |

---

## Colores base (dark)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-base` | #0a0a0b | Fondo app |
| `--bg-elevated` | #141416 | Cards, sidebar |
| `--bg-subtle` | #1c1c1f | Inputs, hover |
| `--border` | #27272a | Bordes |
| `--text-primary` | #fafafa | Texto principal |
| `--text-secondary` | #a1a1aa | Texto secundario |
| `--text-muted` | #71717a | Placeholders |
| `--accent` | #6366f1 | Default indigo; override tenant |
| `--accent-hover` | #818cf8 | Hover CTA |
| `--success` | #22c55e | Confirmado |
| `--warning` | #f59e0b | Pendiente |
| `--error` | #ef4444 | Error, no-show |

---

## Tipografía

| Rol | Font | Size |
|-----|------|------|
| Display | Geist Sans / Inter | 32-40px semibold |
| H1 | | 24px |
| H2 | | 20px |
| Body | | 14-16px |
| Caption | | 12px |

`font-feature-settings: "cv02", "cv03"`

---

## Spacing scale

4px base: 1=4, 2=8, 3=12, 4=16, 6=24, 8=32, 12=48

---

## Radius

| Token | Value |
|-------|-------|
| sm | 6px |
| md | 8px |
| lg | 12px |
| full | 9999px pills |

---

## Shadows

Minimal en dark: `0 1px 2px rgba(0,0,0,0.4)` en cards elevated only.

---

## Tailwind config

```javascript
// tailwind.config.ts excerpt
theme: {
  extend: {
    colors: {
      background: 'var(--bg-base)',
      foreground: 'var(--text-primary)',
      accent: 'var(--accent)',
    }
  }
}
```

---

## Tenant accent override

Cliente app root:

```css
:root {
  --accent: var(--tenant-accent, #6366f1);
}
```

Set desde config API `color_primario`.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
