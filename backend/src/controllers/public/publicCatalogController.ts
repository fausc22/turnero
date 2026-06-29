import { Request, Response, NextFunction } from 'express';
import * as catalogService from '../../services/publicCatalogService';

export async function getServicios(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogService.listServicios();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getProductos(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogService.listProductos();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getProfesionales(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await catalogService.listProfesionales();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
