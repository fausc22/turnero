import { Request, Response, NextFunction } from 'express';
import * as notificacionPanelService from '../../services/notificacionPanelService';

export async function listPlantillas(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificacionPanelService.listPlantillas();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updatePlantilla(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificacionPanelService.updatePlantilla(
      req.params.tipo as never,
      req.params.canal as never,
      req.body.cuerpo
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function whatsappStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificacionPanelService.getWhatsappStatus();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function whatsappReconnect(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificacionPanelService.requestWhatsappReconnect();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getFeatures(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificacionPanelService.getNotificationFeatures();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificacionPanelService.updateNotificationFeatures(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function reenviarConfirmacion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificacionPanelService.reenviarConfirmacionTurno(Number(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
