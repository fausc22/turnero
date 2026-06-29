import request from 'supertest';
import app from '../../src/app';

export const DEMO_TENANT = 'peluqueria-naz';
export const DEMO_EMAIL = 'admin@nazareno.local';
export const DEMO_PASSWORD = 'Password123!';
export const SUPER_EMAIL = 'super@tuturno.local';
export const SUPER_PASSWORD = 'SuperAdmin123!';

export function api() {
  return request(app);
}

export function tenantHeaders(slug: string, token?: string): Record<string, string> {
  const headers: Record<string, string> = { 'x-tenant-slug': slug };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export interface PanelLoginResult {
  token: string;
  refreshToken: string;
  tenantSlug: string;
}

export async function loginPanel(
  email = DEMO_EMAIL,
  password = DEMO_PASSWORD
): Promise<PanelLoginResult> {
  const res = await api()
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  const data = res.body.data;
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    tenantSlug: data.tenantSlug,
  };
}

export async function loginSuper(
  email = SUPER_EMAIL,
  password = SUPER_PASSWORD
): Promise<{ token: string }> {
  const res = await api()
    .post('/api/super/auth/login')
    .send({ email, password })
    .expect(200);

  return { token: res.body.data.token };
}
