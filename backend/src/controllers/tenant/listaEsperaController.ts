import { Request, Response, NextFunction } from 'express';
import * as listaEsperaPanelService from '../../services/listaEsperaPanelService';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await listaEsperaPanelService.listListaEspera();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await listaEsperaPanelService.removeListaEspera(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
