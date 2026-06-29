import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { requireTenantRole } from '../../middlewares/requireTenantRole';
import { validate } from '../../middlewares/validate';
import * as notificacionController from '../../controllers/tenant/notificacionController';
import {
  plantillaParamsSchema,
  updatePlantillaSchema,
  updateNotificationFeaturesSchema,
} from '../../validations/tenant/notificacion';

const auth = [authenticateTenant, requireTenantMatch] as const;
const recepPlus = requireTenantRole('GERENTE', 'RECEPCIONISTA', 'PROFESIONAL');
const gerente = requireTenantRole('GERENTE');

export const plantillasRouter = Router();
plantillasRouter.use(...auth);
plantillasRouter.get('/plantillas-notificacion', recepPlus, notificacionController.listPlantillas);
plantillasRouter.put(
  '/plantillas-notificacion/:tipo/:canal',
  gerente,
  validate(plantillaParamsSchema, 'params'),
  validate(updatePlantillaSchema),
  notificacionController.updatePlantilla
);

const notificacionesRouter = Router();
notificacionesRouter.use(...auth);
notificacionesRouter.get('/whatsapp-status', gerente, notificacionController.whatsappStatus);
notificacionesRouter.post('/whatsapp-reconnect', gerente, notificacionController.whatsappReconnect);
notificacionesRouter.get('/features', gerente, notificacionController.getFeatures);
notificacionesRouter.put(
  '/features',
  gerente,
  validate(updateNotificationFeaturesSchema),
  notificacionController.updateFeatures
);

export default notificacionesRouter;
