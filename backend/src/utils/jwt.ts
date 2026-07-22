import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { getEnv } from '../config/env';

function secrets() {
  const env = getEnv();
  return {
    JWT_SECRET: env.jwtSecret,
    JWT_REFRESH_SECRET: env.jwtRefreshSecret,
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || '1h',
    JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
}

export function generateToken(payload: JwtPayload): string {
  const s = secrets();
  return jwt.sign(payload, s.JWT_SECRET, {
    expiresIn: s.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const s = secrets();
  return jwt.sign(payload, s.JWT_REFRESH_SECRET, {
    expiresIn: s.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, secrets().JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error('Token inválido o expirado');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, secrets().JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new Error('Refresh token inválido o expirado');
  }
}
