import {
  mockExploreApi,
  mockTokenDetailsApi,
  mockUnknownTokenApi,
} from './fixtures/market-api';
import { test, expect } from './fixtures/test';

test.describe('Resource resilience', () => {
  test.use({ allowApiErrors: true });

  test('keeps token markets usable when the summary fails and recovers locally', async ({
    page,
  }) => {
    await mockExploreApi(page, { summaryFailuresBeforeSuccess: 1 });
    await page.goto('/');

    const error = page
      .getByRole('alert')
      .filter({ hasText: 'Market summary unavailable' });
    await expect(error).toContainText(
      'Market summary service is temporarily unavailable.',
    );
    await expect(
      page
        .getByRole('region', { name: 'Token markets table' })
        .locator('tbody tr'),
    ).toHaveCount(250);

    await error.getByRole('button', { name: 'Retry' }).click();
    await expect(
      page.getByRole('region', { name: 'Global market summary' }),
    ).toBeVisible();
    await expect(error).toBeHidden();
  });

  test('keeps the market summary visible when tokens fail and recovers locally', async ({
    page,
  }) => {
    await mockExploreApi(page, { tokenFailuresBeforeSuccess: 1 });
    await page.goto('/');

    await expect(
      page.getByRole('region', { name: 'Global market summary' }),
    ).toBeVisible();
    const error = page
      .getByRole('alert')
      .filter({ hasText: 'Token markets unavailable' });
    await expect(error).toContainText(
      'Token market service is temporarily unavailable.',
    );

    await error.getByRole('button', { name: 'Retry' }).click();
    await expect(
      page
        .getByRole('region', { name: 'Token markets table' })
        .locator('tbody tr'),
    ).toHaveCount(250);
    await expect(error).toBeHidden();
  });

  test('distinguishes an empty token list from an unusable payload', async ({
    page,
  }) => {
    await mockExploreApi(page, { tokenPayload: { tokens: [] } });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'No tokens found' }),
    ).toBeVisible();

    await page.unrouteAll({ behavior: 'wait' });
    await mockExploreApi(page, { tokenPayload: { tokens: [{ id: null }] } });
    await page.reload();
    const malformed = page
      .getByRole('alert')
      .filter({ hasText: 'Token markets unavailable' });
    await expect(malformed).toContainText(
      'Token list contained no usable rows.',
    );
  });

  test('shows and recovers the full token-detail error state', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page, 'alpha-token', {
      detailFailuresBeforeSuccess: 1,
    });
    await page.goto('/tokens/alpha-token?range=24h');

    const error = page
      .getByRole('alert')
      .filter({ hasText: 'Token details unavailable' });
    await expect(error).toContainText(
      'Token details are temporarily unavailable.',
    );
    await expect(
      page.getByRole('link', { name: 'Back to Explore' }),
    ).toBeVisible();

    await error.getByRole('button', { name: 'Retry' }).click();
    await expect(
      page.getByRole('heading', { name: 'Alpha Token', level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
  });

  test('shows a dedicated unknown-token state with a route back to Explore', async ({
    page,
  }) => {
    await mockUnknownTokenApi(page);
    await page.goto('/tokens/missing-token');

    await expect(
      page.getByText('Token not found', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(/No token with the ID “missing-token” exists/),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to Explore' }),
    ).toHaveAttribute('href', '/');
  });

  test('keeps stats usable when history fails and recovers the chart locally', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page, 'alpha-token', {
      historyFailuresBeforeSuccess: { '24h': 1 },
    });
    await page.goto('/tokens/alpha-token?range=24h');

    await expect(
      page.getByRole('heading', { name: 'Highlights (24H)', level: 3 }),
    ).toBeVisible();
    const error = page
      .getByRole('alert')
      .filter({ hasText: 'Could not load 24H history' });
    await expect(error).toContainText('24H price history is unavailable.');

    await error.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
    await expect(error).toBeHidden();
  });

  test('keeps the chart usable when stats fail and recovers stats locally', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page, 'alpha-token', {
      statsFailuresBeforeSuccess: { '24h': 1 },
    });
    await page.goto('/tokens/alpha-token?range=24h');

    await expect(page.getByRole('figure')).toHaveAccessibleName(
      /ALPHA 24H price chart in UTC/,
    );
    const error = page
      .getByRole('alert')
      .filter({ hasText: 'Could not load 24H stats' });
    await expect(error).toContainText('24H token stats are unavailable.');

    await error.getByRole('button', { name: 'Retry' }).click();
    await expect(
      page.getByRole('heading', { name: 'Highlights (24H)', level: 3 }),
    ).toBeVisible();
    await expect(error).toBeHidden();
  });

  test('renders empty history intentionally without hiding successful stats', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page, 'alpha-token', {
      emptyHistoryRanges: ['24h'],
    });
    await page.goto('/tokens/alpha-token?range=24h');

    await expect(
      page.getByRole('heading', { name: 'No price history' }),
    ).toBeVisible();
    await expect(
      page.getByText(/No valid 24H points were returned/),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Highlights (24H)', level: 3 }),
    ).toBeVisible();
  });
});
