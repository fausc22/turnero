import { Request, Response, NextFunction } from 'express';
import { getTenantContext } from '../context/tenantContext';

const BLOCKED_STATUSES = new Set(['PAUSADA', 'MANTENIMIENTO', 'BLOQUEADA']);

export function checkPageStatusActiva(req: Request, res: Response, next: NextFunction): void {
  const ctx = getTenantContext();
  const status = ctx?.pageStatus ?? req.tenant?.page_status ?? 'ACTIVA';

  if (BLOCKED_STATUSES.has(status)) {
    res.status(403).json({
      error: {
        code: 'TENANT_NOT_ACTIVE',
        message: 'La página de reservas no está activa',
        details: { pageStatus: status },
      },
    });
    return;
  }
  next();
}
