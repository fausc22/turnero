import { Router } from 'express';
import { servicioController } from '../controllers/servicioController';
import { authenticate, requireBarberia } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createServicioSchema, updateServicioSchema } from '../utils/validations';

const router = Router();

router.get(
  '/',
  authenticate,
  requireBarberia,
  servicioController.findAll.bind(servicioController)
);

router.get(
  '/:id',
  authenticate,
  requireBarberia,
  servicioController.findById.bind(servicioController)
);

router.post(
  '/',
  authenticate,
  requireBarberia,
  validate(createServicioSchema),
  servicioController.create.bind(servicioController)
);

router.put(
  '/:id',
  authenticate,
  requireBarberia,
  validate(updateServicioSchema),
  servicioController.update.bind(servicioController)
);

router.delete(
  '/:id',
  authenticate,
  requireBarberia,
  servicioController.delete.bind(servicioController)
);

export default router;

