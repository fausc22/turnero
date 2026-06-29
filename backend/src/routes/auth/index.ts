import { Router } from 'express';
import * as tenantAuthController from '../../controllers/auth/tenantAuthController';

const router = Router();

router.post('/login', tenantAuthController.login);
router.post('/refresh', tenantAuthController.refresh);

export default router;
