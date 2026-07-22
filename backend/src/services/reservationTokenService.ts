import crypto from 'crypto';
import { getEnv } from '../config/env';

export function generateTokenGestion(): string {
  return crypto.randomUUID();
}

export function signReservationToken(token: string, secret?: string): string {
  const key = secret || getEnv().reservationTokenSecret;
  return crypto.createHmac('sha256', key).update(token).digest('hex').slice(0, 16);
}

export function verifyReservationSig(token: string, sig: string | undefined): boolean {
  const env = getEnv();
  if (!env.requireReservationSig) {
    // Dev: if sig present, still verify; if absent, allow
    if (!sig) return true;
  } else if (!sig) {
    return false;
  }
  const expected = signReservationToken(token);
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(sig, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildGestionUrl(token: string): string {
  const env = getEnv();
  const base = env.API_PUBLIC_URL || process.env.API_PUBLIC_URL || 'http://api.localhost:4013';
  const sig = signReservationToken(token);
  return `${base}/api/public/reservas/${token}?sig=${sig}`;
}
