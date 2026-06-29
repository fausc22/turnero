import { Request, Response, NextFunction } from 'express';
import * as tenantMetaPanelService from '../../services/tenantMetaPanelService';
import { geocodeDireccion } from '../../services/geocodeService';

export async function getMeta(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await tenantMetaPanelService.getTenantMetaPanel();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateMeta(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await tenantMetaPanelService.updateTenantMetaPanel(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getEstilos(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await tenantMetaPanelService.getTenantEstilosPanel();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateEstilos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await tenantMetaPanelService.updateTenantEstilosPanel(req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function geocode(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await geocodeDireccion();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
