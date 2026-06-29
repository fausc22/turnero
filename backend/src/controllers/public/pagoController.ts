import { Request, Response, NextFunction } from 'express';
import { createPreferenceSchema } from '../../validations/public/pago';
import * as mpService from '../../services/mercadoPagoTenantService';

export async function createPreference(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createPreferenceSchema.parse(req.body);
    const data = await mpService.createPreference(body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
