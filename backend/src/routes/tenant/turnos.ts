import { Router } from 'express';
import { authenticateTenant } from '../../middlewares/tenantAuth';
import { requireTenantMatch } from '../../middlewares/requireTenantMatch';
import { agendaRead, recepWrite } from '../../middlewares/tenantRoles';
import { tenantAudit } from '../../middlewares/tenantAudit';
import { validate } from '../../middlewares/validate';
import * as turnoController from '../../controllers/tenant/turnoController';
import * as notificacionController from '../../controllers/tenant/notificacionController';
import {
  listTurnosQuerySchema,
  turnoIdParamSchema,
  createTurnoManualSchema,
  patchTurnoEstadoSchema,
  reprogramarTurnoSchema,
} from '../../validations/tenant/turno';

const router = Router();
router.use(authenticateTenant, requireTenantMatch);

router.get('/', agendaRead, validate(listTurnosQuerySchema, 'query'), turnoController.list);
router.get('/:id', agendaRead, validate(turnoIdParamSchema, 'params'), turnoController.getById);
router.post('/', recepWrite, tenantAudit('turno.create', 'turno'), validate(createTurnoManualSchema), turnoController.create);
router.patch(
  '/:id/estado',
  recepWrite,
  tenantAudit('turno.estado_change', 'turno'),
  validate(turnoIdParamSchema, 'params'),
  validate(patchTurnoEstadoSchema),
  turnoController.patchEstado
);
router.patch(
  '/:id',
  recepWrite,
  tenantAudit('turno.reprogramar', 'turno'),
  validate(turnoIdParamSchema, 'params'),
  validate(reprogramarTurnoSchema),
  turnoController.reprogramar
);
router.post(
  '/:id/reenviar-confirmacion',
  agendaRead,
  validate(turnoIdParamSchema, 'params'),
  notificacionController.reenviarConfirmacion
);

export default router;
