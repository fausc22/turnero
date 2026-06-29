import { Response, NextFunction } from 'express';
import type { Request } from 'express';
import { verifyTenantAccessToken } from '../utils/tenantJwt';
import { isSuperAccessToken } from '../utils/superJwt';
import { findUsuarioById } from '../repositories/tenant/usuarioRepository';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export function authenticateTenant(req: Request, _res: Response, next: NextFunction): void {
  void (async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token no proporcionado');
      }

      const token = authHeader.slice(7);
      let payload;
      try {
        payload = verifyTenantAccessToken(token);
      } catch (err) {
        if (err instanceof Error && err.message === 'WRONG_TOKEN_TYPE') {
          return next(new ForbiddenError('WRONG_TOKEN_TYPE', 'Token super no válido en ruta tenant'));
        }
        if (err instanceof Error && err.message === 'LEGACY_TOKEN') {
          return next(new UnauthorizedError('Token legacy no soportado en esta ruta'));
        }
        if (isSuperAccessToken(token)) {
          return next(new ForbiddenError('WRONG_TOKEN_TYPE', 'Token super no válido en ruta tenant'));
        }
        throw new UnauthorizedError('Token inválido o expirado');
      }

      const usuario = await findUsuarioById(payload.sub);
      if (!usuario || !usuario.activo) {
        throw new UnauthorizedError('Usuario no válido');
      }

      req.tenantUser = {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        tenantId: payload.tenant_id,
        tenantSlug: payload.tenant_slug,
        profesionalId: usuario.profesional_id ?? null,
      };
      next();
    } catch (err) {
      next(err);
    }
  })();
}
