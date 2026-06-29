import { usuarioRepository } from '../repositories/usuarioRepository';
import { comparePassword } from '../utils/password';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { loginSchema } from '../utils/validations';

interface LoginResult {
  token: string;
  refreshToken: string;
  usuario: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
    barberia_id: number | null;
  };
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    const validated = loginSchema.parse({ email, password });

    const usuario = await usuarioRepository.findByEmail(validated.email);

    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    if (!usuario.activo) {
      throw new UnauthorizedError('Usuario inactivo');
    }

    const passwordMatch = await comparePassword(validated.password, usuario.password_hash);

    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = generateToken({
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      barberiaId: usuario.barberia_id
    });

    const refreshToken = generateRefreshToken({
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      barberiaId: usuario.barberia_id
    });

    return {
      token,
      refreshToken,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        barberia_id: usuario.barberia_id
      }
    };
  }

  async refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const { verifyRefreshToken } = await import('../utils/jwt');
    
    const payload = verifyRefreshToken(refreshToken);
    
    const usuario = await usuarioRepository.findById(payload.usuarioId);
    
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Usuario no válido');
    }

    const newPayload = {
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      barberiaId: usuario.barberia_id
    };

    return {
      token: generateToken(newPayload),
      refreshToken: generateRefreshToken(newPayload)
    };
  }
}

export const authService = new AuthService();

