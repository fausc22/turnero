import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { recepRead } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as clienteController from '../../controllers/tenant/clienteController';
import {
  listClientesQuerySchema,
  clienteIdParamSchema,
  createClienteSchema,
  updateClienteSchema,
} from '../../validations/tenant/cliente';

const router = Router();
router.use(authenticateTenant, requireTenantMatch);

router.get('/', recepRead, validate(listClientesQuerySchema, 'query'), clienteController.list);
router.get(
  '/:id/historial',
  recepRead,
  validate(clienteIdParamSchema, 'params'),
  clienteController.historial
);
router.get('/:id', recepRead, validate(clienteIdParamSchema, 'params'), clienteController.getById);
router.post('/', recepRead, tenantAudit('cliente.create', 'cliente'), validate(createClienteSchema), clienteController.create);
router.put(
  '/:id',
  recepRead,
  tenantAudit('cliente.update', 'cliente'),
  validate(clienteIdParamSchema, 'params'),
  validate(updateClienteSchema),
  clienteController.update
);

export default router;
