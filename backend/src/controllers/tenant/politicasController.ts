import { Request, Response, NextFunction } from 'express';
import * as politicasPanelService from '../../services/politicasPanelService';

export async function getPoliticas(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await politicasPanelService.getPoliticasReserva();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updatePoliticas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await politicasPanelService.updatePoliticasReserva(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function testMp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await politicasPanelService.testMpToken(req.body?.mpAccessToken);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
