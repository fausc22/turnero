# Motor de disponibilidad — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [01-producto/BUSINESS-RULES.md](../01-producto/BUSINESS-RULES.md) |
| Bloquea a | disponibilidadService, tests |

---

## Entrada

```typescript
interface DisponibilidadInput {
  fecha: string;           // YYYY-MM-DD
  servicioIds: number[];
  profesionalId?: number | null;  // null = cualquiera
}
```

## Salida

```typescript
interface Slot {
  fechaInicio: string;     // ISO datetime
  fechaFin: string;
  profesionalId: number | null;
  profesionalNombre?: string;
}
```

---

## Algoritmo

```
1. Cargar politicas_reserva (granularidad, buffer, anticipación)
2. duracionTotal = SUM(servicios.duracion_minutos) + buffer
3. diaSemana = getDay(fecha)
4. horarios = horarios_operativos WHERE dia_semana AND (profesionalId OR profesional IS NULL)
5. Si profesionalId específico: filtrar horarios de ese profesional + generales
6. Si profesionalId null: unir slots de todos profesionales activos que pueden hacer los servicios
7. Generar candidatos cada slot_granularidad desde hora_inicio hasta hora_fin - duracionTotal
8. Filtrar candidatos:
   a. fechaInicio >= now + anticipacion_minima
   b. fechaInicio <= now + anticipacion_maxima
   c. No overlap con turnos PENDIENTE/CONFIRMADO del mismo profesional (o cualquier si sin profesional)
   d. No cae dentro de bloqueos_horarios
9. Ordenar por fechaInicio ASC
10. Retornar array Slot
```

---

## Overlap check

```typescript
function overlaps(aStart, aEnd, bStart, bEnd): boolean {
  return aStart < bEnd && bStart < aEnd;
}
```

---

## Profesional "cualquiera"

Para cada slot candidato del horario general:
- Existe al menos un profesional activo que:
  - Realiza todos los servicioIds
  - Tiene horario que cubre el slot (o usa horario general)
  - No tiene overlap en ese rango

Retornar slot con profesionalId asignado (primer fit) o lista de opciones según UX.

---

## Cache

Opcional Redis futuro. v1: sin cache; query optimizada con índices en fecha_inicio.

---

## Tests obligatorios

- Slot dentro horario OK
- Slot fuera horario excluido
- Bloqueo excluye
- Turno existente excluye
- Duración 90min no entra si cierra 19:00
- Anticipación mínima excluye "ahora"
- Dos reservas concurrentes → segundo SLOT_TAKEN (transaction lock)

---

## Pseudocódigo create reserva

```
BEGIN TRANSACTION
  SELECT turnos FOR UPDATE WHERE overlap...
  IF overlap THEN ROLLBACK SLOT_TAKEN
  INSERT turno, turno_servicios
  IF productos THEN decrement stock
COMMIT
```

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
