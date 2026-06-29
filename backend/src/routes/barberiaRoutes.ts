import { Router } from 'express';
import { barberiaController } from '../controllers/barberiaController';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createBarberiaSchema, updateBarberiaSchema } from '../utils/validations';
import { Rol } from '../types';

const router = Router();

router.get('/', barberiaController.findAll.bind(barberiaController));
router.get('/:id', barberiaController.findById.bind(barberiaController));
router.get('/slug/:slug', barberiaController.findBySlug.bind(barberiaController));

router.post(
  '/',
  authenticate,
  requireRole(Rol.SUPER_ADMIN),
  validate(createBarberiaSchema),
  barberiaController.create.bind(barberiaController)
);

router.put(
  '/:id',
  authenticate,
  requireRole(Rol.SUPER_ADMIN),
  validate(updateBarberiaSchema),
  barberiaController.update.bind(barberiaController)
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Rol.SUPER_ADMIN),
  barberiaController.delete.bind(barberiaController)
);

export default router;

