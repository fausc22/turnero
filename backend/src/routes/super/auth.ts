import { Router } from 'express';
import * as superAuthController from '../../controllers/super/superAuthController';
import { rateLimitAuth } from '../../middlewares/rateLimitAuth';

const router = Router();

router.post('/login', rateLimitAuth as never, superAuthController.login);
router.post('/refresh', rateLimitAuth as never, superAuthController.refresh);

export default router;
