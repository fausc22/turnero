import { Request, Response, NextFunction } from 'express';
import { tenantAuthService } from '../../services/tenantAuthService';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await tenantAuthService.login(email, password, rememberMe);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken, tenantSlug } = req.body;
    const result = await tenantAuthService.refresh(refreshToken, tenantSlug);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usuario = await tenantAuthService.me(req.tenantUser!.id);
    res.json({
      success: true,
      data: {
        ...usuario,
        tenantSlug: req.tenantUser!.tenantSlug,
      },
    });
  } catch (err) {
    next(err);
  }
}
