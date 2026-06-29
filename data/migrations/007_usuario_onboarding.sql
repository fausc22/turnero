-- Fase 7: onboarding wizard — flag por usuario panel
-- Ejecutar en cada tenant DB (script migrate-onboarding.ts)

ALTER TABLE `usuarios`
  ADD COLUMN `onboarding_completado` TINYINT(1) NOT NULL DEFAULT 0;
