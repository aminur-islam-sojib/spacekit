import { test, expect } from '@playwright/test';

test.describe('L2 Fixture Integration (TC-C01, TC-C11, TC-E01..E04, TC-B03..B04)', () => {
  test('TC-C01: visitor page loads with defer and initializes window.__SITEKIT__', async ({ page }) => {
    await page.goto('/tests/fixtures/fluid-engine-page.html');

    const version = await page.evaluate(() => window.__SITEKIT__?.version);
    expect(version).toBe('0.1.0');

    // Asserts official Custom Code Specification attributes exist
    const section = page.locator('[data-sqsp-section="fluid-engine"]');
    await expect(section.first()).toBeVisible();
  });

  test('TC-C11: kill switch ?sitekit=off halts execution completely', async ({ page }) => {
    await page.goto('/tests/fixtures/fluid-engine-page.html?sitekit=off');

    const sitekit = await page.evaluate(() => window.__SITEKIT__);
    expect(sitekit).toBeUndefined();

    // No Spacekit DOM nodes created
    const host = page.locator('#sitekit-host');
    await expect(host).toHaveCount(0);
    const btt = page.locator('[data-sk="backToTop"]');
    await expect(btt).toHaveCount(0);
  });

  test('TC-E01: visitor page never renders editor host in DOM', async ({ page }) => {
    await page.goto('/tests/fixtures/fluid-engine-page.html');

    const host = page.locator('#sitekit-host');
    await expect(host).toHaveCount(0);
  });

  test('TC-E02: editor page (squarespace-config) automatically mounts editor host and launcher', async ({ page }) => {
    await page.goto('/tests/fixtures/edit-mode.html');

    const host = page.locator('#sitekit-host');
    await expect(host).toBeAttached();

    // Access the shadow root launcher button
    const launcher = host.locator('.fab');
    await expect(launcher).toBeVisible();
    await expect(launcher).toHaveAttribute('aria-label', 'Open SiteKit');
  });

  test('TC-E04: manual ?sitekit=edit flag mounts editor on visitor page', async ({ page }) => {
    await page.goto('/tests/fixtures/fluid-engine-page.html?sitekit=edit');

    const host = page.locator('#sitekit-host');
    await expect(host).toBeAttached();

    const launcher = host.locator('.fab');
    await expect(launcher).toBeVisible();
  });

  test('TC-B03 & TC-B04: Back to top button appears on scroll and scrolls to top on click', async ({ page }) => {
    await page.goto('/tests/fixtures/fluid-engine-page.html');

    // Enable back to top via runtime API
    await page.evaluate(() => {
      window.__SITEKIT__?.enable('backToTop', { showAfter: 200, smooth: false });
    });

    const bttButton = page.locator('[data-sk="backToTop"]');
    await expect(bttButton).toBeAttached();

    // Initially at top (scrollY = 0), button opacity is 0
    await expect(bttButton).toHaveCSS('opacity', '0');

    // Scroll down past 300px
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);

    // Button becomes visible
    await expect(bttButton).toHaveCSS('opacity', '1');

    // Click button to return to top
    await bttButton.click();
    await page.waitForTimeout(200);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBe(0);
  });

  test('TC-C09: Mercury AJAX simulation re-initializes features without duplicating', async ({ page }) => {
    await page.goto('/tests/fixtures/ajax-nav.html');

    await page.evaluate(() => {
      window.__SITEKIT__?.enable('backToTop', { showAfter: 100 });
    });

    // Simulate Mercury AJAX navigation
    await page.locator('#simulate-ajax').click();
    await page.waitForTimeout(100);

    // Exactly one button exists in DOM
    const buttons = page.locator('[data-sk="backToTop"]');
    await expect(buttons).toHaveCount(1);
  });
});

