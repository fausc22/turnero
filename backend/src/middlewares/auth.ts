import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { RequestWithUser, Rol } from '../types';

export function authenticate(
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new UnauthorizedError(error.message));
    } else {
      next(new UnauthorizedError('Token inválido'));
    }
  }
}

export function requireRole(...allowedRoles: Rol[]) {
  return (req: RequestWithUser, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Usuario no autenticado'));
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return next(new ForbiddenError('No tienes permisos para esta acción'));
    }

    next();
  };
}

export function requireBarberia(
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError('Usuario no autenticado'));
  }

  if (req.user.rol === Rol.SUPER_ADMIN) {
    return next();
  }

  if (!req.user.barberiaId) {
    return next(new ForbiddenError('Usuario no asociado a una barbería'));
  }

  next();
}

export function requireSameBarberiaOrSuperAdmin(
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError('Usuario no autenticado'));
  }

  if (req.user.rol === Rol.SUPER_ADMIN) {
    return next();
  }

  const barberiaId = req.params.barberiaId || req.body.barberia_id;

  if (!barberiaId || parseInt(barberiaId) !== req.user.barberiaId) {
    return next(
      new ForbiddenError('No puedes acceder a recursos de otra barbería')
    );
  }

  next();
}

