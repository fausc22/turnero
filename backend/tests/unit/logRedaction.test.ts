import { redactString, redactPath, redactMeta } from '../../src/config/logger';

describe('log redaction', () => {
  it('redacta emails y tokens Bearer', () => {
    const raw = 'user admin@example.com Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aaa.bbb';
    const out = redactString(raw);
    expect(out).not.toContain('admin@example.com');
    expect(out).toContain('[REDACTED_EMAIL]');
    expect(out).toContain('Bearer [REDACTED]');
  });

  it('redacta path de reserva', () => {
    expect(redactPath('/api/public/reservas/abc-123?sig=deadbeef')).toBe(
      '/api/public/reservas/[TOKEN]?sig=[REDACTED]'
    );
  });

  it('redacta keys sensibles en meta', () => {
    const out = redactMeta({ password: 'x', path: '/api/public/reservas/tok', ok: 1 });
    expect(out.password).toBe('[REDACTED]');
    expect(out.path).toBe('/api/public/reservas/[TOKEN]');
    expect(out.ok).toBe(1);
  });
});
