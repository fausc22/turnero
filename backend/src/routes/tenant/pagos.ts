import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as pagoController from '../../controllers/tenant/pagoController';
import { listPagosQuerySchema } from '../../validations/tenant/politicas';

const router = Router();
const recepPlus = requireTenantRole('GERENTE', 'RECEPCIONISTA');

router.use(authenticateTenant, requireTenantMatch);

router.get('/', recepPlus, validate(listPagosQuerySchema, 'query'), pagoController.list);

export default router;
