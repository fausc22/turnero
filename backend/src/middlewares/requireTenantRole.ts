import { Response, NextFunction } from 'express';
import type { Request } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export type TenantRol = 'GERENTE' | 'RECEPCIONISTA' | 'PROFESIONAL';

export function requireTenantRole(...roles: TenantRol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.tenantUser) {
      return next(new UnauthorizedError('Usuario no autenticado'));
    }

    if (!roles.includes(req.tenantUser.rol as TenantRol)) {
      return next(new ForbiddenError('FORBIDDEN', 'Rol insuficiente para esta acción'));
    }

    next();
  };
}
