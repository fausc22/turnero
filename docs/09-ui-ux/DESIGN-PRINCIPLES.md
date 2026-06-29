# Principios de diseño — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) |
| Bloquea a | Todas las UIs |

---

## Pilares

### 1. Minimalismo funcional
Cada elemento en pantalla tiene un propósito. Sin decoración gratuita. Espacio en blanco generoso.

### 2. Profesionalismo
Tipografía limpia, alineación estricta, copy claro. El local transmite confianza a sus clientes.

### 3. Ergonomía
Flujos cortos, targets táctiles grandes, feedback inmediato en cada acción.

### 4. Dark-first
Tema oscuro por defecto en panel y cliente. Reduce fatiga visual en uso prolongado (recepcionista).

### 5. Identidad del tenant (solo cliente)
El local aporta logo, color acento e imagen hero sin romper la estructura UI.

---

## Anti-patterns

- No HeroUI/PrimeReact visual language
- No gradientes excesivos
- No modales anidados > 2 niveles
- No tablas densas sin responsive en panel mobile
- No más de 2 fuentes

---

## Referencias visuales

Inspiración: Linear, Cal.com dark, Vercel dashboard — no copiar, adaptar.

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
