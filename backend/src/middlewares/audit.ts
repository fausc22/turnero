import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';

export function auditMiddleware(
  action: string,
  entity: string
) {
  return async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const entityId = req.params.id || req.body.id || null;
        const datosPrevios = req.body.datos_previos || null;
        const datosNuevos = req.body.datos_nuevos || data || null;

        // Importación dinámica para evitar dependencias circulares
        import('../repositories/auditRepository').then(({ auditRepository }) => {
          auditRepository
            .create({
              barberia_id: req.user!.barberiaId || null,
              usuario_id: req.user!.usuarioId,
              accion: action,
              entidad: entity,
              entidad_id: entityId,
              datos_previos: datosPrevios,
              datos_nuevos: datosNuevos
            })
            .catch((err) => {
              console.error('Error al registrar auditoría:', err);
            });
        });
      }

      return originalJson(data);
    };

    next();
  };
}

