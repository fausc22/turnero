import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { gerenteOnly } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as profesionalController from '../../controllers/tenant/profesionalController';
import {
  profesionalIdParamSchema,
  createProfesionalSchema,
  updateProfesionalSchema,
} from '../../validations/tenant/profesional';

const router = Router();
router.use(authenticateTenant, requireTenantMatch);

router.get('/', gerenteOnly, profesionalController.list);
router.post('/', gerenteOnly, tenantAudit('profesional.create', 'profesional'), validate(createProfesionalSchema), profesionalController.create);
router.put(
  '/:id',
  gerenteOnly,
  tenantAudit('profesional.update', 'profesional'),
  validate(profesionalIdParamSchema, 'params'),
  validate(updateProfesionalSchema),
  profesionalController.update
);

export default router;
