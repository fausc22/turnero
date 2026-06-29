# Schema data plane — tuturno_{slug}

| Campo | Valor |
|-------|-------|
| Estado doc | HECHO |
| Última revisión | 2026-05-20 |
| Relacionado con | [SCHEMA-ADMIN.md](./SCHEMA-ADMIN.md), [ER-DIAGRAM.md](./ER-DIAGRAM.md) |
| Bloquea a | data/schema_tenant.sql |

---

## Cambios vs legacy schema.sql

| Legacy | Nuevo |
|--------|-------|
| tabla barberias | tenant_meta (una fila singleton id=1) |
| barberia_id en todas las tablas | **Eliminado** (BD ya es del tenant) |
| usuarios.rol BARBERO/ADMIN | GERENTE, RECEPCIONISTA, PROFESIONAL |
| estilos_barberia | tenant_estilos |

---

## Tabla: tenant_meta

Datos del local (singleton).

| Columna | Tipo |
|---------|------|
| id | TINYINT PK (=1) |
| nombre | VARCHAR(255) |
| email | VARCHAR(255) |
| telefono | VARCHAR(50) |
| direccion | VARCHAR(500) |
| direccion_lat | DECIMAL(10,7) NULL |
| direccion_lng | DECIMAL(10,7) NULL |
| timezone | VARCHAR(64) |
| texto_bienvenida | TEXT |
| updated_at | DATETIME |

---

## Tabla: tenant_estilos

| Columna | Tipo |
|---------|------|
| logo_path | VARCHAR(500) |
| favicon_path | VARCHAR(500) |
| hero_path | VARCHAR(500) |
| color_primario | VARCHAR(7) |
| color_acento | VARCHAR(7) |

---

## Tabla: politicas_reserva

| Columna | Tipo |
|---------|------|
| anticipacion_minima_minutos | INT default 120 |
| anticipacion_maxima_dias | INT default 30 |
| cancelacion_horas_minimas | INT default 2 |
| buffer_minutos | INT default 0 |
| slot_granularidad_minutos | INT default 15 |
| modo_pago | ENUM('SIN_PAGO','SEÑA_PORCENTAJE','SEÑA_FIJA','PAGO_TOTAL','PAGO_EN_LOCAL') |
| seña_porcentaje | DECIMAL(5,2) NULL |
| seña_monto_fijo | DECIMAL(10,2) NULL |
| mp_access_token | VARCHAR(500) NULL |

---

## Tabla: usuarios

| Columna | Tipo |
|---------|------|
| id | INT PK AI |
| profesional_id | INT NULL FK |
| nombre | VARCHAR(255) |
| email | VARCHAR(255) UNIQUE |
| password_hash | VARCHAR(255) |
| rol | ENUM('GERENTE','RECEPCIONISTA','PROFESIONAL') |
| activo | TINYINT(1) |

---

## Tabla: profesionales

| Columna | Tipo |
|---------|------|
| id | INT PK AI |
| nombre | VARCHAR(255) |
| especialidad | VARCHAR(255) |
| foto_path | VARCHAR(500) |
| activo | TINYINT(1) |
| orden | INT |

---

## Tabla: profesional_servicios

M2M qué servicios realiza cada profesional.

---

## Tabla: categorias_servicio

| id, nombre, orden, activo |

---

## Tabla: servicios

| Columna | Tipo |
|---------|------|
| id | INT PK AI |
| categoria_id | INT FK NULL |
| nombre | VARCHAR(255) |
| descripcion | TEXT |
| duracion_minutos | INT |
| precio | DECIMAL(10,2) |
| activo | TINYINT(1) |
| orden | INT |

---

## Tabla: productos

(id, nombre, precio, stock_actual, activo, orden)

---

## Tabla: clientes

(id, nombre, email, telefono, telefono_normalizado, notas_internas, tags JSON, creado_en)

UNIQUE(telefono_normalizado)

---

## Tabla: horarios_operativos

| id | dia_semana TINYINT 0-6 |
| hora_inicio | TIME |
| hora_fin | TIME |
| profesional_id | INT NULL (NULL = local general) |

---

## Tabla: bloqueos_horarios

(id, fecha_inicio DATETIME, fecha_fin DATETIME, motivo, profesional_id NULL)

---

## Tabla: turnos

| Columna | Tipo |
|---------|------|
| id | INT PK AI |
| cliente_id | INT FK |
| profesional_id | INT FK NULL |
| fecha_inicio | DATETIME |
| fecha_fin | DATETIME |
| estado | ENUM('PENDIENTE','CONFIRMADO','CANCELADO','NO_ASISTIO','COMPLETADO') |
| precio_total | DECIMAL(10,2) |
| notas_cliente | TEXT |
| token_gestion | VARCHAR(64) UNIQUE |
| reprogramaciones_count | INT default 0 |
| creado_en | DATETIME |

---

## Tabla: turno_servicios / turno_productos

Snapshot precios (igual legacy).

---

## Tabla: pagos

(turno_id, monto, estado, proveedor, referencia_externa, idempotency_key)

---

## Tabla: notificaciones_enviadas

| id | turno_id | tipo | canal | enviado_en |

Evita duplicar recordatorios.

---

## Tabla: lista_espera

| id | cliente_id | servicio_ids JSON | fecha_desde | fecha_hasta | creado_en | notificado |

---

## Tabla: membresias

(cliente_id, puntos_acumulados) — legacy conservado

---

## Tabla: auditoria

( usuario_id, accion, entidad, entidad_id, datos JSON, creado_en )

---

## Tabla: plantillas_notificacion

| tipo | ENUM confirmacion, recordatorio_24h, cancelacion |
| canal | whatsapp, email |
| cuerpo | TEXT con placeholders {{nombre}}, {{fecha}} |

---

## Estado implementación

Ver [STATUS.md](../STATUS.md).
