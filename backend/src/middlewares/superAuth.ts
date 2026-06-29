import { Response, NextFunction } from 'express';
import { verifySuperAccessToken } from '../utils/superJwt';
import { isTenantAccessToken } from '../utils/tenantJwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { findSuperUsuarioById } from '../repositories/admin/superUsuarioRepository';
import type { Request } from 'express';

export async function authenticateSuper(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.slice(7);
    let payload;
    try {
      payload = verifySuperAccessToken(token);
    } catch (err) {
      if (err instanceof Error && err.message === 'WRONG_TOKEN_TYPE') {
        return next(new ForbiddenError('WRONG_TOKEN_TYPE', 'Token de tenant no válido en ruta super'));
      }
      if (isTenantAccessToken(token)) {
        return next(new ForbiddenError('WRONG_TOKEN_TYPE', 'Token de tenant no válido en ruta super'));
      }
      throw new UnauthorizedError('Token inválido o expirado');
    }

    const superUser = await findSuperUsuarioById(payload.sub);
    if (!superUser || !superUser.activo) {
      throw new UnauthorizedError('Super usuario no válido');
    }

    req.superUser = superUser;
    next();
  } catch (err) {
    next(err);
  }
}
