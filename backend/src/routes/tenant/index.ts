import { Router, Request, Response } from 'express';
import { getTenantContext } from '../../context/tenantContext';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import * as tenantAuthController from '../../controllers/auth/tenantAuthController';
import turnosRouter from './turnos';
import agendaRouter from './agenda';
import clientesRouter from './clientes';
import serviciosRouter from './servicios';
import productosRouter from './productos';
import profesionalesRouter from './profesionales';
import horariosRouter from './horarios';
import bloqueosRouter from './bloqueos';
import eventsRouter from './events';
import politicasRouter from './politicas';
import pagosRouter from './pagos';
import notificacionesRouter, { plantillasRouter } from './notificaciones';
import tenantMetaRouter from './tenantMeta';
import mediaRouter from './media';
import estadisticasRouter from './estadisticas';
import onboardingRouter from './onboarding';
import usuariosRouter from './usuarios';
import listaEsperaRouter from './listaEspera';
import categoriasServicioRouter from './categoriasServicio';

const router = Router();

router.get('/health', authenticateTenant, requireTenantMatch, (_req: Request, res: Response) => {
  const ctx = getTenantContext();
  res.json({
    ok: true,
    tenant: ctx?.tenantSlug ?? null,
    phase: 9,
    authenticated: true,
  });
});

router.get('/me', authenticateTenant, requireTenantMatch, tenantAuthController.me);

router.use('/turnos', turnosRouter);
router.use('/agenda', agendaRouter);
router.use('/clientes', clientesRouter);
router.use('/servicios', serviciosRouter);
router.use('/productos', productosRouter);
router.use('/profesionales', profesionalesRouter);
router.use('/horarios-operativos', horariosRouter);
router.use('/bloqueos', bloqueosRouter);
router.use('/events', eventsRouter);
router.use('/politicas-reserva', politicasRouter);
router.use('/pagos', pagosRouter);
router.use('/notificaciones', notificacionesRouter);
router.use('/media', mediaRouter);
router.use('/estadisticas', estadisticasRouter);
router.use('/onboarding', onboardingRouter);
router.use('/usuarios', usuariosRouter);
router.use('/lista-espera', listaEsperaRouter);
router.use('/categorias-servicio', categoriasServicioRouter);
router.use('/', plantillasRouter);
router.use('/', tenantMetaRouter);

export default router;
