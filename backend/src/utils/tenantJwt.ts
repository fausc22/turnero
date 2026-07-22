import jwt, { SignOptions } from 'jsonwebtoken';
import { getEnv } from '../config/env';

export interface TenantJwtPayload {
  sub: number;
  tenant_id: number;
  tenant_slug: string;
  rol: string;
  email: string;
  type: 'access' | 'refresh';
  remember?: boolean;
}

function secrets() {
  const env = getEnv();
  return {
    JWT_SECRET: env.jwtSecret,
    JWT_REFRESH_SECRET: env.jwtRefreshSecret,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN || '7d',
    JWT_REFRESH_REMEMBER_EXPIRES_IN: env.JWT_REFRESH_REMEMBER_EXPIRES_IN || '30d',
  };
}

export function buildTenantPayload(
  usuario: { id: number; email: string; rol: string },
  tenant: { id: number; slug: string }
): Omit<TenantJwtPayload, 'type'> {
  return {
    sub: usuario.id,
    tenant_id: tenant.id,
    tenant_slug: tenant.slug,
    rol: usuario.rol.toLowerCase(),
    email: usuario.email,
  };
}

export function generateTenantAccessToken(payload: Omit<TenantJwtPayload, 'type'>): string {
  const s = secrets();
  return jwt.sign({ ...payload, type: 'access' }, s.JWT_SECRET, {
    expiresIn: s.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateTenantRefreshToken(
  payload: Omit<TenantJwtPayload, 'type'>,
  rememberMe = false
): string {
  const s = secrets();
  return jwt.sign({ ...payload, type: 'refresh', remember: rememberMe }, s.JWT_REFRESH_SECRET, {
    expiresIn: rememberMe ? s.JWT_REFRESH_REMEMBER_EXPIRES_IN : s.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyTenantAccessToken(token: string): TenantJwtPayload {
  const decoded = jwt.verify(token, secrets().JWT_SECRET) as unknown as TenantJwtPayload;
  if (decoded.type && decoded.type !== 'access') {
    throw new Error('WRONG_TOKEN_TYPE');
  }
  if (!decoded.tenant_slug) {
    throw new Error('LEGACY_TOKEN');
  }
  return { ...decoded, type: 'access' };
}

/** Detecta access token tenant firmado con el secret correcto (p. ej. en rutas super). */
export function isTenantAccessToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, secrets().JWT_SECRET) as unknown as TenantJwtPayload;
    return decoded.type === 'access' && !!decoded.tenant_slug;
  } catch {
    return false;
  }
}

export function verifyTenantRefreshToken(token: string): TenantJwtPayload {
  const decoded = jwt.verify(token, secrets().JWT_REFRESH_SECRET) as unknown as TenantJwtPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('WRONG_TOKEN_TYPE');
  }
  return decoded;
}
