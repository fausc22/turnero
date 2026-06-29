import { Router } from 'express';
import { pagoController } from '../controllers/pagoController';
import { authenticate, requireBarberia } from '../middlewares/auth';

const router = Router();

router.post(
  '/preference',
  authenticate,
  requireBarberia,
  pagoController.createPreference.bind(pagoController)
);

router.post('/webhook', pagoController.webhook.bind(pagoController));

export default router;

