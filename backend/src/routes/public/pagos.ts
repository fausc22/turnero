import { Router } from 'express';
import { checkPageStatusActiva } from '../../middlewares/checkPageStatus';
import * as pagoController from '../../controllers/public/pagoController';

const router = Router();

router.post('/preference', checkPageStatusActiva, pagoController.createPreference);

export default router;
