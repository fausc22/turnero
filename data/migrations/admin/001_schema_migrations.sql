-- Ledger de migraciones (admin + registro por tenant)
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `scope`        ENUM('admin','tenant') NOT NULL,
  `tenant_slug`  VARCHAR(100) NOT NULL DEFAULT '',
  `version`      VARCHAR(100) NOT NULL,
  `checksum`     CHAR(64) NOT NULL,
  `applied_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_scope_tenant_version` (`scope`, `tenant_slug`, `version`),
  KEY `idx_version` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
