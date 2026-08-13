import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import {
  mockExploreApi,
  mockTokenDetailsApi,
  mockUnknownTokenApi,
} from './fixtures/market-api';
import { test, expect } from './fixtures/test';

async function expectNoDocumentOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    )
    .toBe(0);
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }));
  expect(violations, 'WCAG A/AA accessibility violations').toEqual([]);
}

for (const viewport of [
  { width: 1728, height: 1117 },
  { width: 1280, height: 900 },
  { width: 1024, height: 1117 },
]) {
  test(`keeps both routes contained at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await mockExploreApi(page);
    await mockTokenDetailsApi(page);

    await page.goto('/');
    await expect(
      page.getByRole('region', { name: 'Token markets table' }),
    ).toBeVisible();
    await expectNoDocumentOverflow(page);

    const exploreTableBox = await page
      .getByRole('region', { name: 'Token markets table' })
      .boundingBox();
    const exploreFooterBox = await page.locator('footer').boundingBox();
    expect(exploreTableBox).not.toBeNull();
    expect(exploreFooterBox).not.toBeNull();
    expect(
      exploreFooterBox!.y - (exploreTableBox!.y + exploreTableBox!.height),
    ).toBeGreaterThanOrEqual(139);

    await page.goto('/tokens/alpha-token?range=24h');
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
    await expectNoDocumentOverflow(page);

    const chart = page.locator(
      'section[aria-labelledby="price-history-title"]',
    );
    const rail = page.getByRole('complementary', { name: 'Trading preview' });
    const chartBox = await chart.boundingBox();
    const railBox = await rail.boundingBox();
    expect(chartBox).not.toBeNull();
    expect(railBox).not.toBeNull();
    expect(chartBox!.x + chartBox!.width).toBeLessThanOrEqual(railBox!.x);
    expect(railBox!.x + railBox!.width).toBeLessThanOrEqual(viewport.width);
  });
}

test('matches the 1024px condensed frame geometry and control semantics', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 1117 });
  await mockExploreApi(page);
  await page.goto('/');

  await expect(
    page.getByRole('region', { name: 'Token markets table' }),
  ).toBeVisible();

  const boxes = await Promise.all(
    [
      page.getByRole('banner'),
      page.getByRole('region', { name: 'Global market summary' }),
      page.getByRole('region', { name: 'Token markets table' }),
      page.getByRole('contentinfo'),
    ].map((locator) => locator.boundingBox()),
  );

  expect(boxes).toEqual([
    { x: 0, y: 0, width: 1024, height: 72 },
    { x: 24, y: 72, width: 976, height: 140 },
    { x: 24, y: 290, width: 976, height: 604 },
    { x: 0, y: 1033, width: 1024, height: 84 },
  ]);

  await expect(
    page.getByRole('button', { name: 'Search tokens' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('group', { name: 'Currency display' }),
  ).toHaveAttribute('disabled', '');
  const usdCurrency = page.getByRole('radio', { name: 'USD', exact: true });
  await expect(usdCurrency).toBeDisabled();
  await expect(usdCurrency).toBeChecked();
});

test.describe('Keyboard and accessibility', () => {
  test('supports visible keyboard navigation for skip, sort, and range controls', async ({
    page,
  }) => {
    await mockExploreApi(page);
    await mockTokenDetailsApi(page);
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);

    const sort = page.getByRole('button', { name: 'Sort by Price 24H' });
    await sort.focus();
    await expect(sort).toBeFocused();
    await expect
      .poll(() =>
        sort.evaluate((element) => getComputedStyle(element).outlineStyle),
      )
      .not.toBe('none');
    await sort.press('Enter');
    await expect(page).toHaveURL(/sort=changePercent24h&dir=desc/);

    await page.goto('/tokens/alpha-token?range=24h');
    const currentRange = page.getByRole('radio', { name: '24H price range' });
    await currentRange.focus();
    await currentRange.press('ArrowRight');
    const nextRange = page.getByRole('radio', { name: '7D price range' });
    await expect(nextRange).toBeFocused();
    await nextRange.press('Enter');
    await expect(page).toHaveURL(/range=7d$/);
    await expect(nextRange).toHaveAttribute('aria-checked', 'true');
  });

  test('honors reduced-motion preferences', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockExploreApi(page);
    await page.goto('/');

    const sort = page.getByRole('button', { name: 'Sort by Price 24H' });
    await expect
      .poll(() =>
        sort.evaluate((element) =>
          Number.parseFloat(getComputedStyle(element).transitionDuration),
        ),
      )
      .toBeLessThanOrEqual(0.00001);
  });

  test('has no automated WCAG A/AA violations on Explore', async ({ page }) => {
    await mockExploreApi(page);
    await page.goto('/');
    await expect(
      page.getByRole('region', { name: 'Token markets table' }),
    ).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('has no automated WCAG A/AA violations on Token Details', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page);
    await page.goto('/tokens/alpha-token?range=24h');
    await expect(page.getByRole('figure')).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test.describe('error state', () => {
    test.use({ allowApiErrors: true });

    test('has no automated WCAG A/AA violations', async ({ page }) => {
      await mockUnknownTokenApi(page);
      await page.goto('/tokens/missing-token');
      await expect(
        page.getByText('Token not found', { exact: true }),
      ).toBeVisible();
      await expectNoAxeViolations(page);
    });
  });
});
