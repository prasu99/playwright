import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.usatoday.com/money/blueprint/');
  await expect(page.getByRole('main')).toContainText('USA TODAY Blueprint');
  await expect(page.getByRole('link', { name: 'Gold price today: Gold is' })).toBeVisible();
  await page.getByRole('link', { name: 'Money', exact: true }).click();
  await expect(page.locator('h1')).toContainText('Money');
  await expect(page.getByRole('link', { name: 'Powerball winning numbers for' })).toBeVisible();
  await expect(page.locator('iframe[name="google_ads_iframe_7103\\/usatoday\\/poster_scroll_front\\/money\\/main_1"]').contentFrame().getByRole('link')).toBeVisible();
  await expect(page.locator('iframe[name="google_ads_iframe_7103\\/usatoday\\/poster_scroll_front\\/money\\/main_1"]').contentFrame().getByRole('link')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Investing', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Investing', exact: true }).click();
  await page.getByRole('navigation', { name: 'Investing section navigation' }).click();
  await expect(page.getByLabel('Money navigation')).toContainText('Investing');
  await expect(page.getByRole('link', { name: 'How investment guru Warren' })).toBeVisible();
  await page.getByRole('link', { name: 'Shopping' }).click();
  await expect(page.getByLabel('Shopping section navigation')).toContainText('Shopping');
  await expect(page.getByRole('link', { name: 'Save on outdoor gear for life' })).toBeVisible();
});