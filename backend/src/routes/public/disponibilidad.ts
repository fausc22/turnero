import { Router } from 'express';
import { getDisponibilidadHandler } from '../../controllers/public/disponibilidadController';

const router = Router();

router.get('/', getDisponibilidadHandler);

export default router;
