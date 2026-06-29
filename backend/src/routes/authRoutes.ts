import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { loginSchema } from '../utils/validations';

const router = Router();

router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));

export default router;

