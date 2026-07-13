import { expect, test } from '@playwright/test';

test.describe('mobile trainings page', () => {
  test('loads trainings UI on mobile', async ({ page }) => {
    await page.goto('/en/trainings');

    await expect(page).toHaveURL(/\/en\/trainings/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /add|додати|añadir|aggiungi/i })).toBeVisible();
  });
});
