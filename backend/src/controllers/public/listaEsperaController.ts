import { Request, Response, NextFunction } from 'express';
import * as listaEsperaPublicService from '../../services/listaEsperaPublicService';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await listaEsperaPublicService.crearListaEspera(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
