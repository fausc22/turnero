import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as estadisticasController from '../../controllers/tenant/estadisticasController';
import { estadisticasQuerySchema } from '../../validations/tenant/tenantMeta';

const router = Router();
const recepPlus = requireTenantRole('GERENTE', 'RECEPCIONISTA');

router.use(authenticateTenant, requireTenantMatch);

router.get(
  '/resumen',
  recepPlus,
  validate(estadisticasQuerySchema, 'query'),
  estadisticasController.resumen
);
router.get(
  '/servicios-top',
  recepPlus,
  validate(estadisticasQuerySchema, 'query'),
  estadisticasController.serviciosTop
);
router.get(
  '/no-shows',
  recepPlus,
  validate(estadisticasQuerySchema, 'query'),
  estadisticasController.noShows
);

export default router;
