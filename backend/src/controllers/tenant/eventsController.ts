import { Request, Response, NextFunction } from 'express';
import { registerSseClient } from '../../services/sseBroadcast';

export function stream(req: Request, res: Response, next: NextFunction): void {
  try {
    const tenantSlug = req.tenantUser!.tenantSlug;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`event: connected\ndata: ${JSON.stringify({ tenantSlug })}\n\n`);
    registerSseClient(tenantSlug, res);
  } catch (err) {
    next(err);
  }
}
