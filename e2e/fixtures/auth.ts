import type { Page } from '@playwright/test';

export const DEMO_PANEL_EMAIL = 'admin@nazareno.local';
export const DEMO_PANEL_PASSWORD = 'Password123!';
export const SUPER_EMAIL = 'super@tuturno.local';
export const SUPER_PASSWORD = 'SuperAdmin123!';

export async function loginPanel(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(DEMO_PANEL_EMAIL);
  await page.getByLabel('Contraseña').fill(DEMO_PANEL_PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

export async function loginSuper(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(SUPER_EMAIL);
  await page.getByLabel('Contraseña').fill(SUPER_PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.waitForURL(/\/tenants/, { timeout: 30_000 });
}
