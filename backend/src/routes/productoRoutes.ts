import { Router } from 'express';
import { productoController } from '../controllers/productoController';
import { authenticate, requireBarberia } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createProductoSchema, updateProductoSchema } from '../utils/validations';

const router = Router();

router.get(
  '/',
  authenticate,
  requireBarberia,
  productoController.findAll.bind(productoController)
);

router.get(
  '/:id',
  authenticate,
  requireBarberia,
  productoController.findById.bind(productoController)
);

router.post(
  '/',
  authenticate,
  requireBarberia,
  validate(createProductoSchema),
  productoController.create.bind(productoController)
);

router.put(
  '/:id',
  authenticate,
  requireBarberia,
  validate(updateProductoSchema),
  productoController.update.bind(productoController)
);

router.delete(
  '/:id',
  authenticate,
  requireBarberia,
  productoController.delete.bind(productoController)
);

export default router;

