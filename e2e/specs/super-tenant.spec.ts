import { test, expect } from '@playwright/test';
import { loginSuper } from '../fixtures/auth';

test.describe('Super admin', () => {
  test('crear tenant con slug único', async ({ page }) => {
    test.slow();

    const slug = `e2e-${Date.now()}`;
    await loginSuper(page);
    await page.goto('/tenants/nuevo');

    await page.locator('input[name="slug"]').fill(slug);
    await page.locator('input[name="nombre"]').fill(`E2E ${slug}`);
    await page.locator('input[name="gerente_nombre"]').fill('Gerente E2E');
    await page.locator('input[name="gerente_email"]').fill(`gerente-${slug}@test.local`);
    await page.locator('input[name="gerente_password"]').fill('Password123!');

    await page.getByRole('button', { name: 'Crear tenant' }).click();
    await page.waitForURL(new RegExp(`/tenants/\\d+`), { timeout: 120_000 });
    await expect(page).toHaveURL(new RegExp(`/tenants/\\d+`));
  });
});
