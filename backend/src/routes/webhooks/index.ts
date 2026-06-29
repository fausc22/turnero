import { Router } from 'express';
import * as mercadopagoController from '../../controllers/webhooks/mercadopagoController';

const router = Router();

router.post('/mercadopago', mercadopagoController.handleWebhook);

export default router;
