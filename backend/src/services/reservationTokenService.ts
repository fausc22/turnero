import crypto from 'crypto';

export function generateTokenGestion(): string {
  return crypto.randomUUID();
}

export function buildGestionUrl(token: string): string {
  const base = process.env.API_PUBLIC_URL || 'http://api.localhost:4013';
  const secret = process.env.RESERVATION_TOKEN_SECRET;
  if (!secret) {
    return `${base}/api/public/reservas/${token}`;
  }
  const sig = crypto.createHmac('sha256', secret).update(token).digest('hex').slice(0, 16);
  return `${base}/api/public/reservas/${token}?sig=${sig}`;
}
