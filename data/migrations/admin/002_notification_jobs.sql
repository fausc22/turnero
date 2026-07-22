-- Idempotente: ya incluido en schema_admin.sql para installs frescos
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
  `claimed_at`    DATETIME DEFAULT NULL,
  `worker_id`     VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status_created` (`status`, `created_at`),
  KEY `idx_tenant` (`tenant_slug`),
  KEY `idx_processing_claimed` (`status`, `claimed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `whatsapp_session_status` (
  `id`          TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `connected`   TINYINT(1) NOT NULL DEFAULT 0,
  `phone`       VARCHAR(30) DEFAULT NULL,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `whatsapp_session_status` (`id`, `connected`) VALUES (1, 0);
