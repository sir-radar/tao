import { HISTORY_RANGES, RANGE_LABELS } from '../src/lib/api/contracts';
import { mockTokenDetailsApi } from './fixtures/market-api';
import { test, expect } from './fixtures/test';

test.describe('Token Details', () => {
  test('shows stable full-page loading geometry before token details resolve', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page, 'alpha-token', { detailDelayMs: 800 });
    await page.goto('/tokens/alpha-token?range=24h');

    const loading = page.getByRole('main', { name: 'Loading token details' });
    const content = page.getByRole('region', {
      name: 'Token chart and statistics loading',
    });
    const rail = page.getByRole('complementary', {
      name: 'Trading preview loading',
    });
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(content).toBeVisible();
    await expect(rail).toBeVisible();

    const contentBox = await content.boundingBox();
    const railBox = await rail.boundingBox();
    if (!contentBox || !railBox) {
      throw new Error('Expected loading content and rail geometry');
    }
    expect(contentBox.height).toBeGreaterThan(1_600);
    expect(railBox.height).toBeGreaterThan(1_100);
    expect(contentBox.x + contentBox.width).toBeLessThanOrEqual(railBox.x);

    await expect(
      page.getByRole('heading', { name: 'Alpha Token', level: 1 }),
    ).toBeVisible();
    await expect(loading).toBeHidden();
  });

  test('renders headline data, chart, stats, and static trading controls', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page);
    await page.goto('/tokens/alpha-token?range=24h');

    await expect(page).toHaveTitle('Alpha Token Token Details | TAO');
    await expect(
      page.getByRole('heading', { name: 'Alpha Token', level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Breadcrumb' }),
    ).toContainText('SN42');
    await expect(
      page.getByText('Current price: $10.00', { exact: true }),
    ).toBeAttached();

    const chart = page.getByRole('figure');
    await expect(chart).toHaveAccessibleName(/ALPHA 24H price chart in UTC/);
    await expect(chart.locator('canvas').first()).toBeAttached();

    await expect(page.getByRole('tab', { name: 'Stats' })).toHaveAttribute(
      'data-state',
      'active',
    );
    await expect(
      page.getByRole('tab', { name: 'Transactions' }),
    ).toBeDisabled();
    for (const heading of [
      'Highlights (24H)',
      'Financials',
      'Subnet data',
      'Trading volume',
      'Price history',
    ]) {
      await expect(
        page.getByRole('heading', { name: heading, level: 3 }),
      ).toBeVisible();
    }

    const trading = page.getByRole('complementary', {
      name: 'Trading preview',
    });
    await expect(
      trading.getByRole('heading', { name: 'Swap with USDC!' }),
    ).toBeVisible();
    await expect(
      trading.getByRole('heading', { name: 'Position' }),
    ).toBeVisible();
    await expect(
      trading.getByRole('heading', { name: 'Orders' }),
    ).toBeVisible();
    await expect(
      trading.getByRole('button', { name: 'Connect ETH' }),
    ).toBeDisabled();
    await expect(
      trading.getByRole('textbox', { name: 'Sell amount' }),
    ).toBeDisabled();
    await expect(
      trading.getByRole('textbox', { name: 'Buy amount' }),
    ).toBeDisabled();
    await expect(
      trading.getByRole('button', { name: 'Enter an amount' }),
    ).toBeDisabled();
  });

  test('switches every supported range and keeps selection in the URL', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page);
    await page.goto('/tokens/alpha-token?range=24h');

    for (const range of HISTORY_RANGES) {
      const label = RANGE_LABELS[range];
      const control = page.getByRole('radio', {
        name: `${label} price range`,
      });
      if ((await control.getAttribute('aria-checked')) !== 'true') {
        await control.click();
      }

      await expect(page).toHaveURL(new RegExp(`range=${range}(?:&|$)`));
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByRole('figure')).toHaveAccessibleName(
        new RegExp(`ALPHA ${label} price chart in UTC`),
      );
      await expect(
        page.getByRole('heading', { name: `Highlights (${label})` }),
      ).toBeVisible();
    }
  });

  test('normalizes an unsupported range without dropping other URL state', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page);
    await page.goto('/tokens/alpha-token?range=unsupported&view=compact');

    await expect(page).toHaveURL(/range=24h&view=compact$/);
    await expect(
      page.getByRole('radio', { name: '24H price range' }),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
  });

  test('keeps the last choice visible when range responses finish out of order', async ({
    page,
  }) => {
    const requests: string[] = [];
    await mockTokenDetailsApi(page, 'alpha-token', {
      historyDelayMs: { '7d': 900, '1y': 50 },
      statsDelayMs: { '7d': 900, '1y': 50 },
      onRangeRequest: (resource, range) =>
        requests.push(`${resource}:${range}`),
    });
    await page.goto('/tokens/alpha-token?range=24h');
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );

    await page.getByRole('radio', { name: '7D price range' }).click();
    await expect.poll(() => requests).toContain('history:7d');
    await expect.poll(() => requests).toContain('stats:7d');
    await page.getByRole('radio', { name: '1Y price range' }).click();

    await expect(page).toHaveURL(/range=1y$/);
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 1Y price chart in UTC/,
    );
    await expect(
      page.getByRole('heading', { name: 'Highlights (1Y)' }),
    ).toBeVisible();

    await page.waitForTimeout(1_000);
    await expect(
      page.getByRole('radio', { name: '1Y price range' }),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 1Y price chart in UTC/,
    );
    await expect(
      page.getByRole('heading', { name: 'Highlights (1Y)' }),
    ).toBeVisible();
  });

  test('retains prior chart and stats while a new range loads', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page, 'alpha-token', {
      historyDelayMs: { '7d': 800 },
      statsDelayMs: { '7d': 800 },
    });
    await page.goto('/tokens/alpha-token?range=24h');

    const chartSection = page.getByRole('region', { name: 'Price history' });
    const statsSection = page.getByRole('region', {
      name: 'Token statistics',
    });
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
    await expect(
      page.getByRole('heading', { name: 'Highlights (24H)' }),
    ).toBeVisible();

    await page.getByRole('radio', { name: '7D price range' }).click();
    await expect(chartSection).toHaveAttribute('aria-busy', 'true');
    await expect(statsSection).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByText('Updating to 7D')).toBeVisible();
    await expect(page.getByText('Updating stats to 7D')).toBeVisible();
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
    await expect(
      page.getByRole('heading', { name: 'Highlights (24H)' }),
    ).toBeVisible();

    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 7D price chart in UTC/,
    );
    await expect(
      page.getByRole('heading', { name: 'Highlights (7D)' }),
    ).toBeVisible();
    await expect(chartSection).toHaveAttribute('aria-busy', 'false');
    await expect(statsSection).toHaveAttribute('aria-busy', 'false');
  });

  test('reuses fresh cached history and stats when returning to a range', async ({
    page,
  }) => {
    const requestCounts = new Map<string, number>();
    await mockTokenDetailsApi(page, 'alpha-token', {
      onRangeRequest: (resource, range) => {
        const key = `${resource}:${range}`;
        requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
      },
    });
    await page.goto('/tokens/alpha-token?range=24h');
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
    await expect(
      page.getByRole('heading', { name: 'Highlights (24H)' }),
    ).toBeVisible();

    await page.getByRole('radio', { name: '7D price range' }).click();
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 7D price chart in UTC/,
    );
    await expect(
      page.getByRole('heading', { name: 'Highlights (7D)' }),
    ).toBeVisible();

    await page.getByRole('radio', { name: '24H price range' }).click();
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
    await page.waitForTimeout(200);

    expect(requestCounts.get('history:24h')).toBe(1);
    expect(requestCounts.get('stats:24h')).toBe(1);
    expect(requestCounts.get('history:7d')).toBe(1);
    expect(requestCounts.get('stats:7d')).toBe(1);
  });
});
