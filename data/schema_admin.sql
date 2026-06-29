-- ============================================================
-- TuTurno SaaS — CONTROL PLANE (tuturno_admin)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `tuturno_admin`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `tuturno_admin`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `super_usuarios` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(255) NOT NULL,
  `nombre`        VARCHAR(255) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol`           ENUM('superadmin') NOT NULL DEFAULT 'superadmin',
  `activo`        TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenants` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`          VARCHAR(100) NOT NULL,
  `nombre`        VARCHAR(255) NOT NULL,
  `db_name`       VARCHAR(100) DEFAULT NULL,
  `plan`          ENUM('trial','basico','profesional','enterprise') NOT NULL DEFAULT 'trial',
  `status`        ENUM('activo','suspendido','eliminado') NOT NULL DEFAULT 'activo',
  `page_status`   ENUM('ACTIVA','PAUSADA','MANTENIMIENTO','BLOQUEADA') NOT NULL DEFAULT 'ACTIVA',
  `trial_ends_at` DATETIME DEFAULT NULL,
  `config_json`   JSON DEFAULT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_plan` (`plan`),
  KEY `idx_db_name` (`db_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_user_index` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id`   INT UNSIGNED NOT NULL,
  `tenant_slug` VARCHAR(100) NOT NULL,
  `email`       VARCHAR(255) NOT NULL,
  `usuario_id`  INT UNSIGNED NOT NULL,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_tenant_slug` (`tenant_slug`),
  CONSTRAINT `fk_tui_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_domains` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id`  INT UNSIGNED NOT NULL,
  `domain`     VARCHAR(255) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_domain` (`domain`),
  KEY `idx_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_td_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tenant_provisioning_runs` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id`     INT UNSIGNED NOT NULL,
  `status`        ENUM('pending','success','error') NOT NULL DEFAULT 'pending',
  `error_message` TEXT DEFAULT NULL,
  `started_at`    DATETIME DEFAULT NULL,
  `finished_at`   DATETIME DEFAULT NULL,
  `requested_by`  INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_tpr_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tpr_super` FOREIGN KEY (`requested_by`) REFERENCES `super_usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `platform_audit_log` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `super_usuario_id` INT UNSIGNED DEFAULT NULL,
  `action`           VARCHAR(100) NOT NULL,
  `entity_type`      VARCHAR(50) NOT NULL,
  `entity_id`        INT UNSIGNED DEFAULT NULL,
  `payload_json`     JSON DEFAULT NULL,
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`),
  KEY `idx_entity` (`entity_type`, `entity_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_pal_super` FOREIGN KEY (`super_usuario_id`) REFERENCES `super_usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notification_jobs` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_slug`   VARCHAR(100) NOT NULL,
  `turno_id`      INT UNSIGNED DEFAULT NULL,
  `tipo`          VARCHAR(50) NOT NULL,
  `canal`         ENUM('whatsapp','email') NOT NULL,
  `telefono`      VARCHAR(30) DEFAULT NULL,
  `email`         VARCHAR(255) DEFAULT NULL,
  `payload`       JSON NOT NULL,
  `status`        ENUM('pending','processing','sent','failed') NOT NULL DEFAULT 'pending',
  `retries`       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `last_error`    TEXT DEFAULT NULL,
  `created_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at`  DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status_created` (`status`, `created_at`),
  KEY `idx_tenant` (`tenant_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `whatsapp_session_status` (
  `id`          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `connected`   TINYINT(1) NOT NULL DEFAULT 0,
  `phone`       VARCHAR(30) DEFAULT NULL,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `whatsapp_session_status` (`id`, `connected`) VALUES (1, 0);

SET FOREIGN_KEY_CHECKS = 1;
