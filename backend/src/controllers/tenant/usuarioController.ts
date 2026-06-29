import { Request, Response, NextFunction } from 'express';
import * as usuarioPanelService from '../../services/usuarioPanelService';

export async function list(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await usuarioPanelService.listUsuarios();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await usuarioPanelService.createUsuario(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await usuarioPanelService.updateUsuario(
      Number(req.params.id),
      req.body,
      req.tenantUser!.id
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function patchActivo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await usuarioPanelService.setUsuarioActivo(
      Number(req.params.id),
      req.body.activo,
      req.tenantUser!.id
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
