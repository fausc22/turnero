import {
  api,
  loginPanel,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_TENANT,
} from '../helpers/http';

const skipDb = process.env.CI_SKIP_DB === 'true';

(skipDb ? describe.skip : describe)('HTTP auth', () => {
  it('login OK devuelve token y tenantSlug', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
    expect(res.body.data.tenantSlug).toBe(DEMO_TENANT);
  });

  it('credenciales inválidas retorna 401', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: DEMO_EMAIL, password: 'wrong-password-xyz' })
      .expect(401);

    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('email inexistente retorna 401', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: DEMO_PASSWORD })
      .expect(401);

    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('refresh devuelve nuevo token', async () => {
    const login = await loginPanel();
    const res = await api()
      .post('/api/auth/refresh')
      .send({ refreshToken: login.refreshToken, tenantSlug: login.tenantSlug })
      .expect(200);

    expect(res.body.data.token).toBeTruthy();
  });
});
