import { Response, NextFunction } from 'express';
import type { Request } from 'express';
import * as auditoriaRepo from '../repositories/tenant/auditoriaRepository';
import logger from '../config/logger';

export function tenantAudit(action: string, entity: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (data: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.tenantUser) {
        const entityId =
          Number(req.params.id) ||
          (data && typeof data === 'object' && 'data' in data
            ? Number((data as { data?: { id?: number } }).data?.id)
            : null) ||
          null;

        void auditoriaRepo
          .insertAudit({
            usuarioId: req.tenantUser.id,
            accion: action,
            entidad: entity,
            entidadId: entityId || null,
            datosNuevos: data,
          })
          .catch((err) => {
            logger.error('tenantAudit insert failed', {
              action,
              entity,
              error: err instanceof Error ? err.message : String(err),
            });
          });
      }
      return originalJson(data);
    };

    next();
  };
}
