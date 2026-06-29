import { Router, Request, Response, NextFunction } from 'express';
import authRoutes from '../authRoutes';
import barberiaRoutes from '../barberiaRoutes';
import usuarioRoutes from '../usuarioRoutes';
import clienteRoutes from '../clienteRoutes';
import servicioRoutes from '../servicioRoutes';
import productoRoutes from '../productoRoutes';
import turnoRoutes from '../turnoRoutes';
import pagoRoutes from '../pagoRoutes';

const router = Router();

router.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Deprecation', 'true');
  res.setHeader('X-API-Deprecated', 'Use /api/public, /api/tenant, or /api/super');
  next();
});

router.get('/', (_req: Request, res: Response) => {
  res.json({
    deprecated: true,
    message: 'Legacy API — migrar a /api/public|tenant|super',
    mounts: ['auth', 'barberias', 'usuarios', 'clientes', 'servicios', 'productos', 'turnos', 'pagos'],
  });
});

router.use('/auth', authRoutes);
router.use('/barberias', barberiaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/servicios', servicioRoutes);
router.use('/productos', productoRoutes);
router.use('/turnos', turnoRoutes);
router.use('/pagos', pagoRoutes);

export default router;
