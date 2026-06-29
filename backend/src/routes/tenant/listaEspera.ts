import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { gerenteOnly, recepRead } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as listaEsperaController from '../../controllers/tenant/listaEsperaController';
import { z } from 'zod';

const router = Router();
const listaEsperaIdSchema = z.object({ id: z.coerce.number().int().positive() });

router.use(authenticateTenant, requireTenantMatch);

router.get('/', recepRead, listaEsperaController.list);
router.delete(
  '/:id',
  gerenteOnly,
  tenantAudit('lista_espera.remove', 'lista_espera'),
  validate(listaEsperaIdSchema, 'params'),
  listaEsperaController.remove
);

export default router;
