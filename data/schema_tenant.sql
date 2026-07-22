-- ============================================================
-- TuTurno SaaS — DATA PLANE (tuturno_{slug})
-- Ejecutar por tenant via provisioning (Fase 1)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `tenant_meta` (
  `id`               TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  `nombre`           VARCHAR(255) NOT NULL,
  `email`            VARCHAR(255) NOT NULL,
  `telefono`         VARCHAR(50) DEFAULT NULL,
  `direccion`        VARCHAR(500) DEFAULT NULL,
  `direccion_lat`    DECIMAL(10,7) DEFAULT NULL,
  `direccion_lng`    DECIMAL(10,7) DEFAULT NULL,
  `timezone`         VARCHAR(64) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  `texto_bienvenida` TEXT DEFAULT NULL,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_estilos` (
  `id`             TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  `logo_path`      VARCHAR(500) DEFAULT NULL,
  `favicon_path`   VARCHAR(500) DEFAULT NULL,
  `hero_path`      VARCHAR(500) DEFAULT NULL,
  `color_primario` VARCHAR(7) DEFAULT '#6366f1',
  `color_acento`   VARCHAR(7) DEFAULT '#818cf8'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `politicas_reserva` (
  `id`                          TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
  `anticipacion_minima_minutos` INT UNSIGNED NOT NULL DEFAULT 120,
  `anticipacion_maxima_dias`    INT UNSIGNED NOT NULL DEFAULT 30,
  `cancelacion_horas_minimas`   INT UNSIGNED NOT NULL DEFAULT 2,
  `buffer_minutos`              INT UNSIGNED NOT NULL DEFAULT 0,
  `slot_granularidad_minutos`   INT UNSIGNED NOT NULL DEFAULT 15,
  `modo_pago`                   ENUM('SIN_PAGO','SEÑA_PORCENTAJE','SEÑA_FIJA','PAGO_TOTAL','PAGO_EN_LOCAL') NOT NULL DEFAULT 'SIN_PAGO',
  `seña_porcentaje`             DECIMAL(5,2) DEFAULT NULL,
  `seña_monto_fijo`             DECIMAL(10,2) DEFAULT NULL,
  `mp_access_token`             VARCHAR(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profesionales` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`       VARCHAR(255) NOT NULL,
  `especialidad` VARCHAR(255) DEFAULT NULL,
  `foto_path`    VARCHAR(500) DEFAULT NULL,
  `activo`       TINYINT(1) NOT NULL DEFAULT 1,
  `orden`        INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `profesional_id`  INT UNSIGNED DEFAULT NULL,
  `nombre`          VARCHAR(255) NOT NULL,
  `email`           VARCHAR(255) NOT NULL,
  `password_hash`   VARCHAR(255) NOT NULL,
  `rol`             ENUM('GERENTE','RECEPCIONISTA','PROFESIONAL') NOT NULL DEFAULT 'PROFESIONAL',
  `activo`                  TINYINT(1) NOT NULL DEFAULT 1,
  `onboarding_completado`   TINYINT(1) NOT NULL DEFAULT 0,
  `creado_en`               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_rol` (`rol`),
  CONSTRAINT `fk_usuario_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categorias_servicio` (
  `id`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `orden`  INT NOT NULL DEFAULT 0,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `servicios` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `categoria_id`     INT UNSIGNED DEFAULT NULL,
  `nombre`           VARCHAR(255) NOT NULL,
  `descripcion`      TEXT DEFAULT NULL,
  `duracion_minutos` INT UNSIGNED NOT NULL,
  `precio`           DECIMAL(10,2) NOT NULL,
  `activo`           TINYINT(1) NOT NULL DEFAULT 1,
  `orden`            INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `fk_servicio_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_servicio` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profesional_servicios` (
  `profesional_id` INT UNSIGNED NOT NULL,
  `servicio_id`    INT UNSIGNED NOT NULL,
  PRIMARY KEY (`profesional_id`, `servicio_id`),
  CONSTRAINT `fk_ps_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ps_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `productos` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`       VARCHAR(255) NOT NULL,
  `precio`       DECIMAL(10,2) NOT NULL,
  `stock_actual` INT UNSIGNED NOT NULL DEFAULT 0,
  `activo`       TINYINT(1) NOT NULL DEFAULT 1,
  `orden`        INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clientes` (
  `id`                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`               VARCHAR(255) NOT NULL,
  `email`                VARCHAR(255) DEFAULT NULL,
  `telefono`             VARCHAR(50) DEFAULT NULL,
  `telefono_normalizado` VARCHAR(50) DEFAULT NULL,
  `notas_internas`       TEXT DEFAULT NULL,
  `tags`                 JSON DEFAULT NULL,
  `creado_en`            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_telefono_normalizado` (`telefono_normalizado`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `horarios_operativos` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `dia_semana`      TINYINT UNSIGNED NOT NULL COMMENT '0=domingo, 6=sábado',
  `hora_inicio`     TIME NOT NULL,
  `hora_fin`        TIME NOT NULL,
  `profesional_id`  INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_dia` (`dia_semana`),
  CONSTRAINT `fk_horario_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bloqueos_horarios` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha_inicio`   DATETIME NOT NULL,
  `fecha_fin`      DATETIME NOT NULL,
  `motivo`         VARCHAR(255) DEFAULT NULL,
  `profesional_id` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_fecha_fin` (`fecha_fin`),
  CONSTRAINT `fk_bloqueo_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `turnos` (
  `id`                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id`             INT UNSIGNED NOT NULL,
  `profesional_id`         INT UNSIGNED DEFAULT NULL,
  `fecha_inicio`           DATETIME NOT NULL,
  `fecha_fin`              DATETIME NOT NULL,
  `estado`                 ENUM('PENDIENTE','CONFIRMADO','CANCELADO','NO_ASISTIO','COMPLETADO') NOT NULL DEFAULT 'PENDIENTE',
  `precio_total`           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `notas_cliente`          TEXT DEFAULT NULL,
  `token_gestion`          VARCHAR(64) DEFAULT NULL,
  `idempotency_key`        VARCHAR(36) DEFAULT NULL,
  `reprogramaciones_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `creado_en`              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token_gestion` (`token_gestion`),
  UNIQUE KEY `uq_idempotency_key` (`idempotency_key`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_estado` (`estado`),
  KEY `idx_turnos_overlap` (`estado`, `profesional_id`, `fecha_inicio`, `fecha_fin`),
  CONSTRAINT `fk_turno_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_turno_profesional` FOREIGN KEY (`profesional_id`) REFERENCES `profesionales` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `turno_servicios` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `turno_id`        INT UNSIGNED NOT NULL,
  `servicio_id`     INT UNSIGNED NOT NULL,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_turno_servicio` (`turno_id`, `servicio_id`),
  CONSTRAINT `fk_ts_turno` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ts_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `turno_productos` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `turno_id`        INT UNSIGNED NOT NULL,
  `producto_id`     INT UNSIGNED NOT NULL,
  `cantidad`        INT UNSIGNED NOT NULL DEFAULT 1,
  `precio_unitario` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tp_turno` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tp_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pagos` (
  `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `turno_id`           INT UNSIGNED DEFAULT NULL,
  `monto`              DECIMAL(10,2) NOT NULL,
  `estado`             ENUM('PAGADO','FALLIDO','DEVUELTO','PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
  `proveedor`          ENUM('MERCADO_PAGO') NOT NULL DEFAULT 'MERCADO_PAGO',
  `referencia_externa` VARCHAR(255) DEFAULT NULL,
  `idempotency_key`    VARCHAR(255) DEFAULT NULL,
  `creado_en`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_idempotency` (`idempotency_key`),
  KEY `idx_turno` (`turno_id`),
  CONSTRAINT `fk_pago_turno` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notificaciones_enviadas` (
  `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `turno_id`  INT UNSIGNED NOT NULL,
  `tipo`      VARCHAR(50) NOT NULL,
  `canal`     ENUM('whatsapp','email') NOT NULL,
  `enviado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_turno_tipo` (`turno_id`, `tipo`),
  CONSTRAINT `fk_ne_turno` FOREIGN KEY (`turno_id`) REFERENCES `turnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lista_espera` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id`   INT UNSIGNED NOT NULL,
  `servicio_ids` JSON NOT NULL,
  `fecha_desde`  DATE NOT NULL,
  `fecha_hasta`  DATE NOT NULL,
  `notificado`   TINYINT(1) NOT NULL DEFAULT 0,
  `creado_en`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_le_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `membresias` (
  `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cliente_id`         INT UNSIGNED NOT NULL,
  `puntos_acumulados`  INT UNSIGNED NOT NULL DEFAULT 0,
  `actualizado_en`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cliente` (`cliente_id`),
  CONSTRAINT `fk_membresia_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auditoria` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id`   INT UNSIGNED DEFAULT NULL,
  `accion`       VARCHAR(100) NOT NULL,
  `entidad`      VARCHAR(100) NOT NULL,
  `entidad_id`   INT UNSIGNED DEFAULT NULL,
  `datos_previos` JSON DEFAULT NULL,
  `datos_nuevos` JSON DEFAULT NULL,
  `creado_en`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_entidad` (`entidad`, `entidad_id`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `plantillas_notificacion` (
  `id`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo`   ENUM('confirmacion','recordatorio_24h','recordatorio_2h','cancelacion') NOT NULL,
  `canal`  ENUM('whatsapp','email') NOT NULL,
  `cuerpo` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tipo_canal` (`tipo`, `canal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `tenant_meta` (`id`, `nombre`, `email`) VALUES (1, 'Mi Local', 'contacto@local.com');
INSERT IGNORE INTO `tenant_estilos` (`id`) VALUES (1);
INSERT IGNORE INTO `politicas_reserva` (`id`) VALUES (1);

SET FOREIGN_KEY_CHECKS = 1;
