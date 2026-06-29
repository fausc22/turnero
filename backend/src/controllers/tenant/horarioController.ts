import { Request, Response, NextFunction } from 'express';
import * as horarioPanelService from '../../services/horarioPanelService';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await horarioPanelService.listHorarios();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function replaceDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await horarioPanelService.replaceHorarioDay(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await horarioPanelService.deleteHorario(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
