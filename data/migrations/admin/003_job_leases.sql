-- Job leases on notification_jobs + scheduler heartbeats
SET @col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'notification_jobs'
    AND COLUMN_NAME = 'claimed_at'
);
SET @sql := IF(
  @col = 0,
  'ALTER TABLE notification_jobs ADD COLUMN claimed_at DATETIME DEFAULT NULL, ADD COLUMN worker_id VARCHAR(100) DEFAULT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `scheduler_heartbeats` (
  `job_name`      VARCHAR(100) NOT NULL,
  `last_run_at`   DATETIME DEFAULT NULL,
  `last_success_at` DATETIME DEFAULT NULL,
  `last_error`    TEXT DEFAULT NULL,
  `updated_at`    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`job_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
