import { Router } from 'express';
import {
  crearReserva,
  getReserva,
  cancelarReserva,
  reprogramarReserva,
} from '../../controllers/public/reservaPublicaController';
import { checkPageStatusActiva } from '../../middlewares/checkPageStatus';
import { checkPlanLimitsOnReserva } from '../../middlewares/planLimits';

const router = Router();

router.post('/', checkPageStatusActiva, checkPlanLimitsOnReserva, crearReserva);
router.get('/:token', getReserva);
router.post('/:token/cancelar', checkPageStatusActiva, cancelarReserva);
router.post('/:token/reprogramar', checkPageStatusActiva, reprogramarReserva);

export default router;
