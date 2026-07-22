-- Índice de solapamiento para FOR UPDATE / disponibilidad
SET @idx := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'turnos'
    AND INDEX_NAME = 'idx_turnos_overlap'
);
SET @sql := IF(
  @idx = 0,
  'ALTER TABLE turnos ADD KEY idx_turnos_overlap (estado, profesional_id, fecha_inicio, fecha_fin)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
