# Librería de componentes — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) |
| Bloquea a | components/ui |

---

## Base: shadcn/ui + Radix

Instalar via CLI en cada app o package compartido:

- Button (variants: default, outline, ghost, destructive)
- Input, Textarea, Label
- Card, CardHeader, CardContent
- Dialog, Sheet (mobile drawer)
- DropdownMenu, Select
- Checkbox, RadioGroup, Switch
- Tabs
- Toast (sonner)
- Skeleton
- Badge
- Avatar
- Separator
- Tooltip

---

## Custom TuTurno

| Componente | Apps | Descripción |
|------------|------|-------------|
| TurnoStatusBadge | panel | Colores por estado |
| ServiceCard | frontend | Selectable |
| TimeSlotButton | frontend | Slot grid cell |
| AgendaGrid | panel | Calendario |
| StatCard | panel | Dashboard metric |
| EmptyState | all | |
| PageHeader | panel | Title + actions |
| Sidebar | panel, super | Nav |
| TenantPreview | panel | Mini mock cliente |

---

## Convenciones

- Props `className` merge con tailwind-merge
- Variants con CVA
- Forward refs en inputs
- `data-testid` en elementos E2E críticos

---

## No usar

HeroUI, PrimeReact, MUI

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
