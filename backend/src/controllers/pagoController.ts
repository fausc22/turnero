import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { mercadoPagoService } from '../services/mercadoPagoService';

class PagoController {
  async createPreference(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> {
    try {
      const { turnoId, backUrl } = req.body;
      const barberiaId = req.user?.barberiaId;
      if (!barberiaId) {
        return next(new Error('Barbería no especificada'));
      }
      const preference = await mercadoPagoService.createPreference(turnoId, barberiaId, backUrl);
      res.json({ success: true, data: preference });
    } catch (error) {
      next(error);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await mercadoPagoService.processWebhook(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const pagoController = new PagoController();

