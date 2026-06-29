import { Request, Response, NextFunction } from 'express';
import * as clientePanelService from '../../services/clientePanelService';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await clientePanelService.listClientes(req.query as never);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await clientePanelService.getCliente(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await clientePanelService.createCliente(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await clientePanelService.updateCliente(Number(req.params.id), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function historial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await clientePanelService.getClienteHistorial(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
