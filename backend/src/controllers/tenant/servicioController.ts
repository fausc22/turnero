import { Request, Response, NextFunction } from 'express';
import * as catalogPanelService from '../../services/catalogPanelService';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogPanelService.listServicios();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogPanelService.createServicio(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogPanelService.updateServicio(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogPanelService.deleteServicio(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
