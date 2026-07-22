import jwt, { SignOptions } from 'jsonwebtoken';
import type { SuperJwtPayload } from '../types/super';
import { getEnv } from '../config/env';

function secrets() {
  const env = getEnv();
  return {
    SUPER_JWT_SECRET: env.superJwtSecret,
    SUPER_JWT_REFRESH_SECRET: env.superJwtRefreshSecret,
    SUPER_JWT_EXPIRES_IN: env.SUPER_JWT_EXPIRES_IN || '8h',
    SUPER_JWT_REFRESH_EXPIRES_IN: env.SUPER_JWT_REFRESH_EXPIRES_IN || '7d',
  };
}

export function generateSuperAccessToken(payload: Omit<SuperJwtPayload, 'type'>): string {
  const s = secrets();
  return jwt.sign({ ...payload, type: 'access' }, s.SUPER_JWT_SECRET, {
    expiresIn: s.SUPER_JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateSuperRefreshToken(payload: Omit<SuperJwtPayload, 'type'>): string {
  const s = secrets();
  return jwt.sign({ ...payload, type: 'refresh' }, s.SUPER_JWT_REFRESH_SECRET, {
    expiresIn: s.SUPER_JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifySuperAccessToken(token: string): SuperJwtPayload {
  const decoded = jwt.verify(token, secrets().SUPER_JWT_SECRET) as unknown as SuperJwtPayload;
  if (decoded.type !== 'access') {
    throw new Error('WRONG_TOKEN_TYPE');
  }
  return decoded;
}

/** Detecta access token super firmado con el secret correcto (p. ej. en rutas tenant). */
export function isSuperAccessToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, secrets().SUPER_JWT_SECRET) as unknown as SuperJwtPayload;
    return decoded.type === 'access';
  } catch {
    return false;
  }
}

export function verifySuperRefreshToken(token: string): SuperJwtPayload {
  const decoded = jwt.verify(
    token,
    secrets().SUPER_JWT_REFRESH_SECRET
  ) as unknown as SuperJwtPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('WRONG_TOKEN_TYPE');
  }
  return decoded;
}
