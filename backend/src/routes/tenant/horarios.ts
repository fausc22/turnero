import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as horarioController from '../../controllers/tenant/horarioController';
import { replaceHorarioDaySchema, horarioIdParamSchema } from '../../validations/tenant/horario';

const router = Router();
const gerenteOnly = requireTenantRole('GERENTE');

router.use(authenticateTenant, requireTenantMatch, gerenteOnly);

router.get('/', horarioController.list);
router.put('/', validate(replaceHorarioDaySchema), horarioController.replaceDay);
router.delete('/:id', validate(horarioIdParamSchema, 'params'), horarioController.remove);

export default router;
