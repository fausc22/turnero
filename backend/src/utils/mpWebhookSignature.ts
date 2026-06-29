import crypto from 'crypto';

export function verifyMpWebhookSignature(params: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string | undefined;
  secret: string | undefined;
}): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  if (!xSignature || !xRequestId || !dataId) {
    return false;
  }

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k.trim(), v.trim()];
    })
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const computed = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return computed === v1;
}
