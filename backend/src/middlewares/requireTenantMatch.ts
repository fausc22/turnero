import { Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import type { Request } from 'express';
import { normalizeSlug } from '../utils/slug';

export function requireTenantMatch(req: Request, _res: Response, next: NextFunction): void {
  if (!req.tenantUser) {
    return next(new UnauthorizedError('Usuario no autenticado'));
  }

  const headerSlug = normalizeSlug(String(req.headers['x-tenant-slug'] || ''));
  const tokenSlug = normalizeSlug(req.tenantUser.tenantSlug ?? '');

  if (!headerSlug || !tokenSlug || headerSlug !== tokenSlug) {
    return next(new ForbiddenError('TENANT_MISMATCH', 'El token no corresponde al tenant del header'));
  }

  next();
}
