import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import * as eventsController from '../../controllers/tenant/eventsController';

const router = Router();

router.get(
  '/stream',
  authenticateTenant,
  requireTenantMatch,
  requireTenantRole('GERENTE', 'RECEPCIONISTA', 'PROFESIONAL'),
  eventsController.stream
);

export default router;
