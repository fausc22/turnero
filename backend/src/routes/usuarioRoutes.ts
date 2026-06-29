import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createUsuarioSchema, updateUsuarioSchema } from '../utils/validations';
import { Rol } from '../types';
import { usuarioRepository } from '../repositories/usuarioRepository';

const router = Router();

router.get(
  '/me',
  authenticate,
  async (req: any, res: any, next: any) => {
    try {
      const usuario = await usuarioRepository.findById(req.user.usuarioId);
      if (!usuario) {
        return res.status(404).json({ success: false, error: { message: 'Usuario no encontrado', statusCode: 404 } });
      }
      // No devolver password_hash
      const { password_hash, ...usuarioSinPassword } = usuario;
      res.json({ success: true, data: usuarioSinPassword });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  authenticate,
  requireRole(Rol.SUPER_ADMIN, Rol.ADMIN_BARBERIA),
  usuarioController.findAll.bind(usuarioController)
);

router.get(
  '/:id',
  authenticate,
  requireRole(Rol.SUPER_ADMIN, Rol.ADMIN_BARBERIA),
  usuarioController.findById.bind(usuarioController)
);

router.post(
  '/',
  authenticate,
  requireRole(Rol.SUPER_ADMIN, Rol.ADMIN_BARBERIA),
  validate(createUsuarioSchema),
  usuarioController.create.bind(usuarioController)
);

router.put(
  '/:id',
  authenticate,
  requireRole(Rol.SUPER_ADMIN, Rol.ADMIN_BARBERIA),
  validate(updateUsuarioSchema),
  usuarioController.update.bind(usuarioController)
);

router.delete(
  '/:id',
  authenticate,
  requireRole(Rol.SUPER_ADMIN, Rol.ADMIN_BARBERIA),
  usuarioController.delete.bind(usuarioController)
);

export default router;

