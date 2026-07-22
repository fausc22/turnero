import { verifyMpWebhookSignature } from '../../src/utils/mpWebhookSignature';
import crypto from 'crypto';

describe('mpWebhookSignature', () => {
  const secret = 'test-mp-webhook-secret-value';
  const dataId = '12345';
  const requestId = 'req-abc';
  const ts = Math.floor(Date.now() / 1000).toString();
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  it('acepta firma válida fresca', () => {
    expect(
      verifyMpWebhookSignature({
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(true);
  });

  it('rechaza timestamp viejo', () => {
    const oldTs = (Math.floor(Date.now() / 1000) - 10_000).toString();
    const oldManifest = `id:${dataId};request-id:${requestId};ts:${oldTs};`;
    const oldV1 = crypto.createHmac('sha256', secret).update(oldManifest).digest('hex');
    expect(
      verifyMpWebhookSignature({
        xSignature: `ts=${oldTs},v1=${oldV1}`,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(false);
  });

  it('rechaza firma alterada', () => {
    expect(
      verifyMpWebhookSignature({
        xSignature: `ts=${ts},v1=${'0'.repeat(64)}`,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(false);
  });
});
