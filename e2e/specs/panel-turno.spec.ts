import { test, expect } from '@playwright/test';
import { loginPanel } from '../fixtures/auth';

test.describe('Panel agenda', () => {
  test('login, agenda y crear turno manual', async ({ page }) => {
    test.slow();

    await loginPanel(page);
    await page.goto('/agenda', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Agenda' })).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: 'Nuevo' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Nuevo turno')).toBeVisible();

    const telefono = `11${Date.now().toString().slice(-8)}`;
    await page.getByLabel('Nombre nuevo').fill('E2E Panel');
    await page.getByLabel('Teléfono', { exact: true }).fill(telefono);
    await page.getByRole('button', { name: 'Corte' }).click();

    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 21);
    const hh = String(10 + (Date.now() % 5)).padStart(2, '0');
    const local = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}T${hh}:30`;
    await page.getByLabel('Fecha y hora').fill(local);

    await page.getByRole('button', { name: 'Crear turno' }).click();
    await expect(page.getByText('Turno creado')).toBeVisible({ timeout: 30_000 });
  });
});
