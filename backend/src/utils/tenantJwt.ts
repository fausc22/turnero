import jwt, { SignOptions } from 'jsonwebtoken';

export interface TenantJwtPayload {
  sub: number;
  tenant_id: number;
  tenant_slug: string;
  rol: string;
  email: string;
  type: 'access' | 'refresh';
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-change-me-min-32-chars!!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-change-me-min-32!!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const JWT_REFRESH_REMEMBER_EXPIRES_IN = process.env.JWT_REFRESH_REMEMBER_EXPIRES_IN || '30d';

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
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateTenantRefreshToken(
  payload: Omit<TenantJwtPayload, 'type'>,
  rememberMe = false
): string {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: rememberMe ? JWT_REFRESH_REMEMBER_EXPIRES_IN : JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyTenantAccessToken(token: string): TenantJwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as unknown as TenantJwtPayload;
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
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as TenantJwtPayload;
    return decoded.type === 'access' && !!decoded.tenant_slug;
  } catch {
    return false;
  }
}

export function verifyTenantRefreshToken(token: string): TenantJwtPayload {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as unknown as TenantJwtPayload;
  if (decoded.type !== 'refresh') {
    throw new Error('WRONG_TOKEN_TYPE');
  }
  return decoded;
}
