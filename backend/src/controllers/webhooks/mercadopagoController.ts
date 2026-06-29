import { Request, Response, NextFunction } from 'express';
import * as mpService from '../../services/mercadoPagoTenantService';

export async function handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await mpService.processWebhookNotification({
      type: req.body?.type,
      data: req.body?.data,
      queryTopic: typeof req.query.topic === 'string' ? req.query.topic : undefined,
      queryId: typeof req.query.id === 'string' ? req.query.id : undefined,
      queryTenant: typeof req.query.tenant === 'string' ? req.query.tenant : undefined,
      xSignature: req.headers['x-signature'] as string | undefined,
      xRequestId: req.headers['x-request-id'] as string | undefined,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}
