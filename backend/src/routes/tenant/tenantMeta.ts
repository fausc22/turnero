import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as tenantMetaController from '../../controllers/tenant/tenantMetaController';
import { updateTenantMetaSchema, updateTenantEstilosSchema } from '../../validations/tenant/tenantMeta';

const router = Router();
const gerente = requireTenantRole('GERENTE');

router.use(authenticateTenant, requireTenantMatch);

router.get('/tenant-meta', gerente, tenantMetaController.getMeta);
router.put(
  '/tenant-meta',
  gerente,
  validate(updateTenantMetaSchema),
  tenantMetaController.updateMeta
);
router.post('/tenant-meta/geocode', gerente, tenantMetaController.geocode);
router.get('/tenant-estilos', gerente, tenantMetaController.getEstilos);
router.put(
  '/tenant-estilos',
  gerente,
  validate(updateTenantEstilosSchema),
  tenantMetaController.updateEstilos
);

export default router;
