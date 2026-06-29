import { api, loginPanel, loginSuper, tenantHeaders, DEMO_TENANT } from '../helpers/http';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('HTTP security', () => {
  it('tenant mismatch en /api/tenant/me retorna 403', async () => {
    const { token } = await loginPanel();
    const res = await api()
      .get('/api/tenant/me')
      .set(tenantHeaders('estetica-luna', token))
      .expect(403);

    expect(res.body.error.code).toBe('TENANT_MISMATCH');
  });

  it('token tenant rechazado en API super', async () => {
    const { token } = await loginPanel();
    const res = await api()
      .get('/api/super/tenants')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(res.body.error.code).toBe('WRONG_TOKEN_TYPE');
  });

  it('token super rechazado en API tenant autenticada', async () => {
    const { token } = await loginSuper();
    const res = await api()
      .get('/api/tenant/health')
      .set(tenantHeaders(DEMO_TENANT, token))
      .expect(403);

    expect(res.body.error.code).toBe('WRONG_TOKEN_TYPE');
  });

  it('ruta pública sin x-tenant-slug retorna 400', async () => {
    const res = await api().get('/api/public/config').expect(400);
    expect(res.body.error.code).toBe('NO_TENANT_SLUG');
  });
});
