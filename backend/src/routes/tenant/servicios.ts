import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { gerenteOnly } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as servicioController from '../../controllers/tenant/servicioController';
import {
  servicioIdParamSchema,
  createServicioSchema,
  updateServicioSchema,
} from '../../validations/tenant/servicio';

const router = Router();
router.use(authenticateTenant, requireTenantMatch);

router.get('/', gerenteOnly, servicioController.list);
router.post('/', gerenteOnly, tenantAudit('servicio.create', 'servicio'), validate(createServicioSchema), servicioController.create);
router.put(
  '/:id',
  gerenteOnly,
  tenantAudit('servicio.update', 'servicio'),
  validate(servicioIdParamSchema, 'params'),
  validate(updateServicioSchema),
  servicioController.update
);
router.delete(
  '/:id',
  gerenteOnly,
  tenantAudit('servicio.delete', 'servicio'),
  validate(servicioIdParamSchema, 'params'),
  servicioController.remove
);

export default router;
