import { Router } from 'express';
import { clienteController } from '../controllers/clienteController';
import { authenticate, requireBarberia } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createClienteSchema, updateClienteSchema } from '../utils/validations';

const router = Router();

router.get(
  '/',
  authenticate,
  requireBarberia,
  clienteController.findAll.bind(clienteController)
);

router.get(
  '/:id',
  authenticate,
  requireBarberia,
  clienteController.findById.bind(clienteController)
);

router.post(
  '/',
  authenticate,
  requireBarberia,
  validate(createClienteSchema),
  clienteController.create.bind(clienteController)
);

router.put(
  '/:id',
  authenticate,
  requireBarberia,
  validate(updateClienteSchema),
  clienteController.update.bind(clienteController)
);

router.delete(
  '/:id',
  authenticate,
  requireBarberia,
  clienteController.delete.bind(clienteController)
);

export default router;

