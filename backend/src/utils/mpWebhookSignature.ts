import crypto from 'crypto';

const DEFAULT_MAX_SKEW_SEC = 300;

export function verifyMpWebhookSignature(params: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string | undefined;
  secret: string | undefined;
  nowMs?: number;
  maxSkewSec?: number;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;
  const maxSkewSec = params.maxSkewSec ?? DEFAULT_MAX_SKEW_SEC;
  const nowMs = params.nowMs ?? Date.now();

  if (!secret) {
    // Never accept unsigned webhooks in production; allow only explicit non-prod without secret
    return process.env.NODE_ENV !== 'production' && process.env.ALLOW_INSECURE_MP_WEBHOOK === 'true';
  }

  if (!xSignature || !xRequestId || !dataId) {
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k.trim(), (v ?? '').trim()];
    })
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const tsNum = parseInt(ts, 10);
  if (!Number.isFinite(tsNum)) return false;
  const skew = Math.abs(nowMs / 1000 - tsNum);
  if (skew > maxSkewSec) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  try {
    const a = Buffer.from(computed, 'utf8');
    const b = Buffer.from(v1, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
