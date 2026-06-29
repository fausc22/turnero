import jwt, { SignOptions } from 'jsonwebtoken';
import type { SuperJwtPayload } from '../types/super';

const SUPER_JWT_SECRET = process.env.SUPER_JWT_SECRET || 'dev-super-jwt-change-me-min-32!!!';
const SUPER_JWT_REFRESH_SECRET =
  process.env.SUPER_JWT_REFRESH_SECRET || 'dev-super-refresh-change-me-min-32';
const SUPER_JWT_EXPIRES_IN = process.env.SUPER_JWT_EXPIRES_IN || '8h';
const SUPER_JWT_REFRESH_EXPIRES_IN = process.env.SUPER_JWT_REFRESH_EXPIRES_IN || '7d';

export function generateSuperAccessToken(payload: Omit<SuperJwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, SUPER_JWT_SECRET, {
    expiresIn: SUPER_JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateSuperRefreshToken(payload: Omit<SuperJwtPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'refresh' }, SUPER_JWT_REFRESH_SECRET, {
    expiresIn: SUPER_JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifySuperAccessToken(token: string): SuperJwtPayload {
  const decoded = jwt.verify(token, SUPER_JWT_SECRET) as unknown as SuperJwtPayload;
  if (decoded.type !== 'access') {
    throw new Error('WRONG_TOKEN_TYPE');
  }
  return decoded;
}

/** Detecta access token super firmado con el secret correcto (p. ej. en rutas tenant). */
export function isSuperAccessToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, SUPER_JWT_SECRET) as unknown as SuperJwtPayload;
    return decoded.type === 'access';
  } catch {
    return false;
  }
}

export function verifySuperRefreshToken(token: string): SuperJwtPayload {
  const decoded = jwt.verify(token, SUPER_JWT_REFRESH_SECRET) as unknown as SuperJwtPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('WRONG_TOKEN_TYPE');
  }
  return decoded;
}
