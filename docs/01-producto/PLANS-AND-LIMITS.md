# Planes y límites — TuTurno SaaS

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [08-panel-super/SCREENS.md](../08-panel-super/SCREENS.md), [04-datos/SCHEMA-ADMIN.md](../04-datos/SCHEMA-ADMIN.md) |
| Bloquea a | Provisioning, feature flags, validaciones |

---

## Planes

| Feature | trial | basico | profesional | enterprise |
|---------|:-----:|:------:|:-----------:|:----------:|
| Duración | 14 días | — | — | — |
| Profesionales max | 1 | 2 | 10 | ilimitado |
| Turnos/mes | 100 | 500 | ilimitado | ilimitado |
| WhatsApp confirmación | ✓ | ✓ | ✓ | ✓ |
| Recordatorios 24h/2h | — | ✓ | ✓ | ✓ |
| Mercado Pago | — | ✓ | ✓ | ✓ |
| Estadísticas | básico | básico | avanzado | avanzado |
| Personalización branding | básico | ✓ | ✓ | ✓ |
| Lista de espera | — | — | ✓ | ✓ |
| Múltiples usuarios panel | 1 | 3 | 10 | ilimitado |
| Soporte | email | email | prioritario | dedicado |
| Dominio custom | — | — | — | ✓ (prod futuro) |

---

## Feature flags en config

Almacenados en `tenants.config_json.features`:

```json
{
  "whatsapp": true,
  "whatsapp_recordatorios": true,
  "mercadopago": true,
  "lista_espera": false,
  "estadisticas_avanzadas": false,
  "max_profesionales": 2,
  "max_usuarios_panel": 3,
  "max_turnos_mes": 500
}
```

Backend valida límites en:
- Crear profesional → `max_profesionales`
- Crear usuario panel → `max_usuarios_panel`
- Crear turno → contador mensual `max_turnos_mes`

---

## Enforcement

| Violación | Respuesta |
|-----------|-----------|
| Excede profesionales | 403 `PLAN_LIMIT_PROFESIONALES` |
| Excede turnos/mes | 403 `PLAN_LIMIT_TURNOS` |
| Feature deshabilitada | 403 `FEATURE_NOT_AVAILABLE` |
| Trial expirado | 403 `TRIAL_EXPIRED` → panel bloqueado, cliente PAUSADA |

---

## Trial

- `tenants.plan = trial`
- `tenants.trial_ends_at = created_at + 14 days`
- Job diario verifica expiración
- Super admin puede extender manualmente

---

## Cambio de plan

Solo super admin en panel-super. Audit log obligatorio.

---

## Implementación local

Para desarrollo local todos los tenants demo usan plan `profesional` sin límites estrictos (flag `DEV_UNLIMITED=true` en backend).

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
