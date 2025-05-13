import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';


// Ensure screenshots directory exists
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}


// Set test timeout to 60 seconds
test.setTimeout(60000);


// Helper function for delay
async function delay(ms: number) {
  console.log(`Waiting for ${ms/1000} seconds...`);
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Helper functions
async function setupPage(page: Page) {
  await page.setViewportSize({ width: 1280, height: 720 });
  page.on('pageerror', error => console.error('[RUNTIME ERROR]', error));
}

async function trackPerformanceMetrics(page: Page, pageUrl: string) {
  const startTime = Date.now();
  
  const performanceEntries = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .map(entry => ({
        name: entry.name,
        duration: Number(entry.duration.toFixed(1)),
        initiatorType: (entry as PerformanceResourceTiming).initiatorType || 'unknown'
      }))
      .filter(entry => {
        try {
          const url = new URL(entry.name);
          return url.hostname.includes('forbes.com');
        } catch {
          return false;
        }
      })
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
  });

  const totalLoadTime = ((Date.now() - startTime) / 1000).toFixed(3);
  console.log(`\nTotal Load Time for ${pageUrl}: ${totalLoadTime} seconds`);
  console.log(`\nTop 5 slowest internal resources for ${pageUrl}:`);
  console.table(performanceEntries);
  
  test.info().annotations.push({ 
    type: 'metric', 
    description: `Total Load Time: ${totalLoadTime}s` 
  });
}

// Common assertions that are used across all pages
async function verifyCommonElements(page: Page) {
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await trackPerformanceMetrics(page, 'Current page');
  await delay(60000); // 1 minute delay
}

// Home page test
test('Home page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/au/');
  await page.mouse.move(Math.random() * 800, Math.random() * 800);
  await page.mouse.click(Math.random() * 1000, Math.random() * 1000);
  await expect(page.locator('h1')).toContainText('Smart Financial Decisions Made Simple');
  await expect(page.getByRole('link', { name: 'Forbes Logo' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Smart Financial Decisions' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'forbes', exact: true })).toBeVisible();
  await verifyCommonElements(page);
});

// Investing page test
test('Investing page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/au/investing/');
  await page.mouse.move(Math.random() * 800, Math.random() * 800);
  await page.mouse.click(Math.random() * 1000, Math.random() * 1000);
  await expect(page.locator('h1')).toContainText('How To Invest');
  await verifyCommonElements(page);
  await page.getByRole('link', { name: 'How To Invest', exact: true }).click();
  await expect(page.getByRole('link', { name: 'How To Invest', exact: true })).toBeVisible();
});

// Credit Cards page test
test('Credit Cards page verification', async ({ page }) => {
  await page.goto('https://www.forbes.com/advisor/au/credit-cards/best-credit-cards/');
  await page.mouse.move(Math.random() * 800, Math.random() * 800);
  await page.mouse.click(Math.random() * 1000, Math.random() * 1000);
  await expect(page.locator('h1')).toContainText('Our Pick Of The Best Credit Cards For Australians');
  await verifyCommonElements(page);
});


