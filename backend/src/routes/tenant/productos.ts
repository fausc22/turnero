import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { gerenteOnly } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as productoController from '../../controllers/tenant/productoController';
import {
  productoIdParamSchema,
  createProductoSchema,
  updateProductoSchema,
} from '../../validations/tenant/producto';

const router = Router();
router.use(authenticateTenant, requireTenantMatch);

router.get('/', gerenteOnly, productoController.list);
router.post('/', gerenteOnly, tenantAudit('producto.create', 'producto'), validate(createProductoSchema), productoController.create);
router.put(
  '/:id',
  gerenteOnly,
  tenantAudit('producto.update', 'producto'),
  validate(productoIdParamSchema, 'params'),
  validate(updateProductoSchema),
  productoController.update
);

export default router;
