import { Request, Response, NextFunction } from 'express';
import * as estadisticasPanelService from '../../services/estadisticasPanelService';

export async function resumen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to } = req.query as { from: string; to: string };
    const data = await estadisticasPanelService.getResumen(from, to);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function serviciosTop(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to } = req.query as { from: string; to: string };
    const data = await estadisticasPanelService.getServiciosTop(from, to);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function noShows(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { from, to } = req.query as { from: string; to: string };
    const data = await estadisticasPanelService.getNoShows(from, to);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
