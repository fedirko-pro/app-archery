import { expect, test } from '@playwright/test';

test.describe('mobile trainings page', () => {
  test('loads trainings UI on mobile', async ({ page }) => {
    await page.goto('/en/trainings');

    await expect(page).toHaveURL(/\/en\/trainings/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /add training|додати|añadir|aggiungi/i })).toBeVisible();
  });

  test('shows athlete bottom tab bar with trainings active', async ({ page }) => {
    await page.goto('/en/trainings');

    const tabBar = page.getByRole('navigation', { name: /main navigation|головна навігація/i });
    await expect(tabBar).toBeVisible();

    const trainingsTab = tabBar.getByRole('link', { name: /trainings|тренуван/i });
    await expect(trainingsTab).toBeVisible();
    await expect(trainingsTab).toHaveClass(/bottom-tab-bar__link--active/);
    await expect(trainingsTab).toHaveAttribute('href', /\/en\/trainings/);

    await expect(page.locator('footer.app-footer')).toHaveCount(0);
  });

  test('home shows primary training CTA', async ({ page }) => {
    await page.goto('/en/home');

    await expect(
      page.getByRole('button', { name: /log training|continue session|записати|продовжити/i }),
    ).toBeVisible();
  });
});
