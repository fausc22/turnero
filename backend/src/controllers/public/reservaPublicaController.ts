import { Request, Response, NextFunction } from 'express';
import * as reservaService from '../../services/reservaPublicaService';
import {
  createReservaPublicaSchema,
  reprogramarReservaSchema,
} from '../../validations/reservaPublica';

function getIdempotencyKey(req: Request, body: { idempotencyKey?: string }): string | undefined {
  const header = req.headers['idempotency-key'];
  if (typeof header === 'string' && header) return header;
  return body.idempotencyKey;
}

export async function crearReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createReservaPublicaSchema.parse(req.body);
    const idempotencyKey = getIdempotencyKey(req, body);
    const result = await reservaService.crearReserva({
      ...body,
      idempotencyKey,
      cliente: {
        ...body.cliente,
        email: body.cliente.email || undefined,
      },
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await reservaService.getReservaByToken(req.params.token);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function cancelarReserva(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await reservaService.cancelarReserva(req.params.token);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function reprogramarReserva(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = reprogramarReservaSchema.parse(req.body);
    const data = await reservaService.reprogramarReserva(req.params.token, body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
