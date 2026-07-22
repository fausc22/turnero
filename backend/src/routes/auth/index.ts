import { Router } from 'express';
import * as tenantAuthController from '../../controllers/auth/tenantAuthController';
import { rateLimitAuth } from '../../middlewares/rateLimitAuth';

const router = Router();

router.post('/login', rateLimitAuth as never, tenantAuthController.login);
router.post('/refresh', rateLimitAuth as never, tenantAuthController.refresh);

export default router;
