import { Request, Response, NextFunction } from 'express';
import * as turnoPanelService from '../../services/turnoPanelService';

function getActor(req: Request) {
  return turnoPanelService.actorFromUser(req.tenantUser!);
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await turnoPanelService.listTurnos(req.query as never, getActor(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await turnoPanelService.getTurnoDetalle(Number(req.params.id), getActor(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await turnoPanelService.createTurnoManual(req.body, getActor(req));
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function patchEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await turnoPanelService.patchEstado(
      Number(req.params.id),
      req.body.estado,
      getActor(req)
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function reprogramar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await turnoPanelService.reprogramarTurno(
      Number(req.params.id),
      req.body,
      getActor(req)
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
