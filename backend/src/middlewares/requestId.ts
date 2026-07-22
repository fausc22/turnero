import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && incoming.trim()
      ? incoming.trim().slice(0, 64)
      : crypto.randomUUID();
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}
