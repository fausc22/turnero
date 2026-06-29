import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as agendaController from '../../controllers/tenant/agendaController';
import { agendaQuerySchema } from '../../validations/tenant/turno';

const router = Router();

router.use(
  authenticateTenant,
  requireTenantMatch,
  requireTenantRole('GERENTE', 'RECEPCIONISTA', 'PROFESIONAL')
);

router.get('/', validate(agendaQuerySchema, 'query'), agendaController.getAgenda);

export default router;
