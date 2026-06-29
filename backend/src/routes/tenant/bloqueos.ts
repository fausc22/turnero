import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as bloqueoController from '../../controllers/tenant/bloqueoController';
import {
  listBloqueosQuerySchema,
  bloqueoIdParamSchema,
  createBloqueoSchema,
} from '../../validations/tenant/bloqueo';

const router = Router();
const recepPlus = requireTenantRole('GERENTE', 'RECEPCIONISTA');
const gerenteOnly = requireTenantRole('GERENTE');

router.use(authenticateTenant, requireTenantMatch);

router.get('/', recepPlus, validate(listBloqueosQuerySchema, 'query'), bloqueoController.list);
router.post('/', gerenteOnly, validate(createBloqueoSchema), bloqueoController.create);
router.delete(
  '/:id',
  gerenteOnly,
  validate(bloqueoIdParamSchema, 'params'),
  bloqueoController.remove
);

export default router;
