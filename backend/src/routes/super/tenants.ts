import { Router } from 'express';
import * as superTenantController from '../../controllers/super/superTenantController';

const router = Router();

router.get('/', superTenantController.list);
router.post('/', superTenantController.create);
router.get('/:id', superTenantController.getById);
router.put('/:id', superTenantController.update);
router.delete('/:id', superTenantController.remove);
router.post('/:id/reprovision', superTenantController.reprovision);

export default router;
