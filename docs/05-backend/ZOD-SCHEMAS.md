# Zod Schemas — TuTurno

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [ENDPOINTS.md](./ENDPOINTS.md) |
| Bloquea a | backend/src/validations/ |

---

## Ubicación

```
backend/src/validations/
├── auth.ts
├── reservaPublica.ts
├── turno.ts
├── cliente.ts
├── servicio.ts
├── profesional.ts
├── horario.ts
├── tenant.ts
└── super.ts
```

Middleware: `validate(schema, 'body' | 'query' | 'params')`

---

## Ejemplos clave

### createReservaPublicaSchema

```typescript
z.object({
  servicioIds: z.array(z.number().int().positive()).min(1),
  productos: z.array(z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().min(1).max(10),
  })).optional(),
  profesionalId: z.number().int().positive().nullable(),
  fechaInicio: z.string().datetime(),
  cliente: z.object({
    nombre: z.string().min(2).max(255),
    telefono: z.string().min(8).max(20),
    email: z.string().email().optional().or(z.literal('')),
  }),
  notas: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid(),
});
```

### disponibilidadQuerySchema

```typescript
z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  servicioIds: z.string().transform(s => s.split(',').map(Number)),
  profesionalId: z.coerce.number().optional(),
});
```

### createTenantSuperSchema

```typescript
z.object({
  slug: z.string().regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/),
  nombre: z.string().min(2).max(255),
  plan: z.enum(['trial','basico','profesional','enterprise']),
  gerenteEmail: z.string().email(),
  gerenteNombre: z.string().min(2),
  gerentePassword: z.string().min(8).optional(), // auto-gen si omitido
});
```

---

## Sincronización frontend

Duplicar schemas críticos en `frontend/lib/validations.ts`, `panel/lib/validations.ts` o importar desde paquete compartido `@tuturno/validations` (fase 8).

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
