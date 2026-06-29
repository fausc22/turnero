import { test, expect } from '@playwright/test';

test.describe('Reserva cliente', () => {
  test('flujo completo — servicio Corte hasta confirmación', async ({ page }) => {
    test.slow();

    await page.goto('/reservar', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Servicios' })).toBeVisible({ timeout: 30_000 });

    await page.getByText('Corte', { exact: true }).first().click();
    await page.getByRole('button', { name: 'Continuar' }).last().click();

    await expect(page.getByRole('heading', { name: 'Profesional' })).toBeVisible();
    await page.getByText('Cualquier disponible').click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Fecha y hora' })).toBeVisible();
    const slotButtons = page.locator('button').filter({ hasText: /^\d{1,2}:\d{2}$/ });
    await expect(slotButtons.first()).toBeVisible({ timeout: 30_000 });
    await slotButtons.first().click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    const telefono = `11${Date.now().toString().slice(-8)}`;
    await page.getByLabel('Nombre').fill('E2E Cliente');
    await page.getByLabel('Teléfono').fill(telefono);
    await page.locator('#politica').click();
    await page.locator('#cliente-form').getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar reserva' }).click();

    await page.waitForURL(/\/confirmacion/, { timeout: 60_000 });
    await expect(page.getByText('¡Turno confirmado!')).toBeVisible();
  });
});
