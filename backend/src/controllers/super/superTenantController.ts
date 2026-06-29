import { Request, Response, NextFunction } from 'express';
import { superTenantService } from '../../services/superTenantService';
import type { TenantPlan, TenantStatus } from '../../types/tenant';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      status: req.query.status as TenantStatus | undefined,
      plan: req.query.plan as TenantPlan | undefined,
      search: req.query.search as string | undefined,
    };
    const tenants = await superTenantService.list(filters);
    res.json({ success: true, data: tenants });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await superTenantService.getById(parseInt(req.params.id, 10));
    res.json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await superTenantService.create(req.body, req.superUser!.id);
    res.status(201).json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await superTenantService.update(
      parseInt(req.params.id, 10),
      req.body,
      req.superUser!.id
    );
    res.json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await superTenantService.softDelete(parseInt(req.params.id, 10), req.superUser!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function reprovision(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenant = await superTenantService.reprovision(
      parseInt(req.params.id, 10),
      req.body,
      req.superUser!.id
    );
    res.json({ success: true, data: tenant });
  } catch (err) {
    next(err);
  }
}
