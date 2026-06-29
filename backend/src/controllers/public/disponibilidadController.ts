import { Request, Response, NextFunction } from 'express';
import { getDisponibilidad } from '../../services/disponibilidadService';
import { disponibilidadQuerySchema } from '../../validations/reservaPublica';

export async function getDisponibilidadHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = disponibilidadQuerySchema.parse(req.query);
    const slots = await getDisponibilidad({
      fecha: query.fecha,
      servicioIds: query.servicioIds,
      profesionalId: query.profesionalId,
    });
    res.json({ success: true, data: { slots } });
  } catch (err) {
    next(err);
  }
}
