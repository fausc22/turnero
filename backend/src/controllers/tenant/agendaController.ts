import { Request, Response, NextFunction } from 'express';
import * as turnoPanelService from '../../services/turnoPanelService';

export async function getAgenda(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = turnoPanelService.actorFromUser(req.tenantUser!);
    const data = await turnoPanelService.getAgenda(req.query as never, actor);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
