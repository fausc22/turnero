import { Request, Response, NextFunction } from 'express';
import * as horarioPanelService from '../../services/horarioPanelService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await horarioPanelService.listBloqueos(req.query as never);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await horarioPanelService.createBloqueo(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await horarioPanelService.deleteBloqueo(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
