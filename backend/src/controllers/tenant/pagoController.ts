import { Request, Response, NextFunction } from 'express';
import * as pagoPanelService from '../../services/pagoPanelService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await pagoPanelService.listPagos(req.query as never);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
