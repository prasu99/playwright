import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Ensure screenshots directory exists
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

test('Full audit for AU site', async ({ page }) => {
  const start = Date.now();
  const title = test.info().title.replace(/ /g, '-');

  try {
    console.log(`[STATUS] Starting audit for AU site`);

    // Set consistent viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Capture runtime JS errors
    page.on('pageerror', error => {
      console.error('[RUNTIME ERROR]', error);
    });

    await page.goto('https://www.forbes.com/advisor/au/', { waitUntil: 'load' });

    const loadTime = ((Date.now() - start) / 1000).toFixed(3);
    test.info().annotations.push({ type: 'metric', description: `LoadTime:${loadTime}` });

    // UI Heading check
    const heading = page.getByRole('heading', { name: 'Smart Financial Decisions Made Simple' });
    await expect(heading).toBeVisible();
    console.log('[INFO] UI heading check passed for AU');

    // Extract top 10 slowest resources
    const performanceEntries = await page.evaluate(() => {
      return performance.getEntriesByType('resource')
        .map(entry => ({
          name: entry.name,
          duration: Number(entry.duration.toFixed(1)),
          initiatorType: (entry as PerformanceResourceTiming).initiatorType || 'unknown'
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);
    });

    console.log('Top 10 slowest resources for AU:');
    console.table(performanceEntries);

    // Screenshot on success
    await page.screenshot({ path: path.join(screenshotsDir, `${title}.png`), fullPage: true });
    console.log(`[INFO] Screenshot saved for AU site audit`);

    console.log('[STATUS] AU site audit complete ✅');
  } catch (error) {
    console.error('[ERROR] AU site audit failed ❌', error);

    
    await page.screenshot({ path: path.join(screenshotsDir, `${title}-failure.png`), fullPage: true });

    throw error;
  }
});
