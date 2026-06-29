import { Router } from 'express';
import * as superAuthController from '../../controllers/super/superAuthController';

const router = Router();

router.post('/login', superAuthController.login);
router.post('/refresh', superAuthController.refresh);

export default router;
