-- Idempotency key en turnos (tenants existentes sin columna)
SET @col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'turnos'
    AND COLUMN_NAME = 'idempotency_key'
);
SET @sql := IF(
  @col = 0,
  'ALTER TABLE turnos ADD COLUMN idempotency_key VARCHAR(36) DEFAULT NULL AFTER token_gestion, ADD UNIQUE KEY uq_idempotency_key (idempotency_key)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
