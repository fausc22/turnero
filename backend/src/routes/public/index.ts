import { Router, Request, Response } from 'express';
import { getTenantContext } from '../../context/tenantContext';
import configRoutes from './config';
import catalogRoutes from './catalog';
import disponibilidadRoutes from './disponibilidad';
import reservasRoutes from './reservas';
import pagosRoutes from './pagos';
import listaEsperaRoutes from './listaEspera';
import assetsRoutes from './assets';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const ctx = getTenantContext();
  res.json({
    ok: true,
    tenant: ctx?.tenantSlug ?? null,
    phase: 6,
  });
});

router.use('/config', configRoutes);
router.use('/', catalogRoutes);
router.use('/disponibilidad', disponibilidadRoutes);
router.use('/reservas', reservasRoutes);
router.use('/pagos', pagosRoutes);
router.use('/lista-espera', listaEsperaRoutes);
router.use('/asset', assetsRoutes);

export default router;
