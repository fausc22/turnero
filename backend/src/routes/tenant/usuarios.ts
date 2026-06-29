import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { gerenteOnly } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as usuarioController from '../../controllers/tenant/usuarioController';
import {
  usuarioIdParamSchema,
  createUsuarioSchema,
  updateUsuarioSchema,
  patchUsuarioActivoSchema,
} from '../../validations/tenant/usuario';

const router = Router();

router.use(authenticateTenant, requireTenantMatch, gerenteOnly);

router.get('/', usuarioController.list);
router.post('/', tenantAudit('usuario.create', 'usuario'), validate(createUsuarioSchema), usuarioController.create);
router.put(
  '/:id',
  tenantAudit('usuario.update', 'usuario'),
  validate(usuarioIdParamSchema, 'params'),
  validate(updateUsuarioSchema),
  usuarioController.update
);
router.patch(
  '/:id/activo',
  tenantAudit('usuario.activo', 'usuario'),
  validate(usuarioIdParamSchema, 'params'),
  validate(patchUsuarioActivoSchema),
  usuarioController.patchActivo
);

export default router;
