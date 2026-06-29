import { Request, Response, NextFunction } from 'express';
import * as categoriaPanelService from '../../services/categoriaPanelService';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await categoriaPanelService.listCategorias();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await categoriaPanelService.createCategoria(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await categoriaPanelService.updateCategoria(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
