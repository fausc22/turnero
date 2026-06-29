import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as politicasController from '../../controllers/tenant/politicasController';
import { updatePoliticasSchema } from '../../validations/tenant/politicas';

const router = Router();
const gerente = requireTenantRole('GERENTE');

router.use(authenticateTenant, requireTenantMatch, gerente);

router.get('/', politicasController.getPoliticas);
router.put('/', validate(updatePoliticasSchema), politicasController.updatePoliticas);
router.post('/test-mp', politicasController.testMp);

export default router;
