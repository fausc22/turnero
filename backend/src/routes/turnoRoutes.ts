import { Router } from 'express';
import { turnoController } from '../controllers/turnoController';
import { authenticate, requireBarberia } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createTurnoSchema, updateTurnoSchema } from '../utils/validations';

const router = Router();

router.get(
  '/',
  authenticate,
  requireBarberia,
  turnoController.findAll.bind(turnoController)
);

router.get(
  '/:id',
  authenticate,
  requireBarberia,
  turnoController.findById.bind(turnoController)
);

router.post(
  '/',
  authenticate,
  requireBarberia,
  validate(createTurnoSchema),
  turnoController.create.bind(turnoController)
);

router.put(
  '/:id',
  authenticate,
  requireBarberia,
  validate(updateTurnoSchema),
  turnoController.update.bind(turnoController)
);

router.delete(
  '/:id',
  authenticate,
  requireBarberia,
  turnoController.delete.bind(turnoController)
);

export default router;

