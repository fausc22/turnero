import { comparePassword } from '../utils/password';
import { UnauthorizedError } from '../utils/errors';
import { findSuperUsuarioByEmail } from '../repositories/admin/superUsuarioRepository';
import {
  generateSuperAccessToken,
  generateSuperRefreshToken,
  verifySuperRefreshToken,
} from '../utils/superJwt';
import { superLoginSchema } from '../utils/validations';
import { logPlatformEvent } from './platformAuditService';

export class SuperAuthService {
  async login(email: string, password: string) {
    const validated = superLoginSchema.parse({ email, password });
    const user = await findSuperUsuarioByEmail(validated.email);

    if (!user || !user.activo) {
      await logPlatformEvent({
        action: 'SUPER_LOGIN_FAILED',
        entityType: 'super_usuario',
        payload: { email: validated.email },
      });
      throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const match = await comparePassword(validated.password, user.password_hash);
    if (!match) {
      await logPlatformEvent({
        action: 'SUPER_LOGIN_FAILED',
        entityType: 'super_usuario',
        entityId: user.id,
        payload: { email: validated.email },
      });
      throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const payload = { sub: user.id, email: user.email, rol: 'superadmin' as const };
    const token = generateSuperAccessToken(payload);
    const refreshToken = generateSuperRefreshToken(payload);

    await logPlatformEvent({
      superUsuarioId: user.id,
      action: 'SUPER_LOGIN_SUCCESS',
      entityType: 'super_usuario',
      entityId: user.id,
    });

    return {
      token,
      refreshToken,
      usuario: { id: user.id, email: user.email, nombre: user.nombre },
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifySuperRefreshToken(refreshToken);
    const user = await findSuperUsuarioByEmail(payload.email);
    if (!user || !user.activo) {
      throw new UnauthorizedError('Super usuario no válido');
    }

    const tokenPayload = { sub: user.id, email: user.email, rol: 'superadmin' as const };
    return {
      token: generateSuperAccessToken(tokenPayload),
      refreshToken: generateSuperRefreshToken(tokenPayload),
    };
  }
}

export const superAuthService = new SuperAuthService();
