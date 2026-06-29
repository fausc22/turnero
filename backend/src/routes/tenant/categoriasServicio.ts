import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { gerenteOnly } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as categoriaController from '../../controllers/tenant/categoriaController';
import {
  categoriaIdParamSchema,
  createCategoriaSchema,
  updateCategoriaSchema,
} from '../../validations/tenant/categoriaServicio';

const router = Router();

router.use(authenticateTenant, requireTenantMatch, gerenteOnly);

router.get('/', categoriaController.list);
router.post('/', tenantAudit('categoria.create', 'categoria_servicio'), validate(createCategoriaSchema), categoriaController.create);
router.put(
  '/:id',
  tenantAudit('categoria.update', 'categoria_servicio'),
  validate(categoriaIdParamSchema, 'params'),
  validate(updateCategoriaSchema),
  categoriaController.update
);

export default router;
