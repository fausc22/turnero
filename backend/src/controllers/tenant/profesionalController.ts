import { Request, Response, NextFunction } from 'express';
import * as catalogPanelService from '../../services/catalogPanelService';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogPanelService.listProfesionales();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogPanelService.createProfesional(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogPanelService.updateProfesional(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
