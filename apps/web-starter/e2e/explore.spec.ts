import { test, expect } from './fixtures/test';
import { mockExploreApi, mockTokenDetailsApi } from './fixtures/market-api';

test.describe('Explore Tokens', () => {
  test.beforeEach(async ({ page }) => {
    await mockExploreApi(page);
  });

  test('renders the market summary and complete token table', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Explore Tokens | TAO');
    await expect(
      page.getByRole('heading', { name: 'Explore Tokens' }),
    ).toBeVisible();

    const summary = page.getByRole('region', { name: 'Global market summary' });
    await expect(summary).toBeVisible();
    for (const label of [
      'Market cap',
      'Volume (24h)',
      'Vol/Mkt Cap (24h)',
      'Daily Trades',
      'Daily Traders',
      'Active wallets',
    ]) {
      await expect(summary.getByText(label, { exact: true })).toBeVisible();
    }

    const tableRegion = page.getByRole('region', {
      name: 'Token markets table',
    });
    await expect(tableRegion).toBeVisible();
    await expect(tableRegion.locator('tbody tr')).toHaveCount(250);
    await expect(tableRegion.locator('tbody tr').first()).toContainText(
      'Alpha Token',
    );

    await expect(
      page.getByRole('columnheader', { name: 'Name', exact: true }),
    ).toBeAttached();
    for (const heading of [
      'Market cap',
      'Price',
      'Price 24H',
      'Price 7D',
      'Price 1M',
      '24H Net Volume',
      'Buy Volume',
      'Sell Volume',
      'Transactions',
      'Emissions',
    ]) {
      await expect(
        page.getByRole('button', {
          name: `Sort by ${heading}`,
          exact: true,
        }),
      ).toBeAttached();
    }

    await expect(
      page.getByRole('button', { name: 'Market filters preview' }),
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Swap Alpha Token preview' }),
    ).toBeDisabled();
  });

  test('sorts movement in both directions and persists it in the URL', async ({
    page,
  }) => {
    await page.goto('/');
    const table = page.getByRole('region', { name: 'Token markets table' });
    const sortButton = page.getByRole('button', {
      name: 'Sort by Price 24H',
    });
    const header = page.getByRole('columnheader').filter({ has: sortButton });

    await sortButton.click();
    await expect(page).toHaveURL(/\?sort=changePercent24h&dir=desc$/);
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect(table.locator('tbody tr').first()).toContainText('Beta Token');

    await sortButton.click();
    await expect(page).toHaveURL(/\?sort=changePercent24h&dir=asc$/);
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(table.locator('tbody tr').first()).toContainText(
      'Alpha Token',
    );

    await page.reload();
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(table.locator('tbody tr').first()).toContainText(
      'Alpha Token',
    );
  });

  test('supports keyboard scrolling and row action menu semantics', async ({
    page,
  }) => {
    await page.goto('/');
    const table = page.getByRole('region', { name: 'Token markets table' });

    await table.focus();
    await page.keyboard.press('End');
    await expect
      .poll(() => table.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await page.keyboard.press('Home');
    await expect
      .poll(() => table.evaluate((element) => element.scrollLeft))
      .toBe(0);

    const actions = page.getByRole('button', {
      name: 'More actions for Alpha Token',
    });
    await expect(actions).toHaveAttribute('aria-expanded', 'false');
    await actions.click();
    await expect(actions).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByRole('menu', { name: 'Actions for Alpha Token' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Add to watchlist' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await actions.press('Escape');
    await expect(
      page.getByRole('menu', { name: 'Actions for Alpha Token' }),
    ).toBeHidden();
  });

  test('navigates from a token link to its shareable details route', async ({
    page,
  }) => {
    await mockTokenDetailsApi(page);
    await page.goto('/');

    await page.getByRole('link', { name: /Alpha Token/ }).click();

    await expect(page).toHaveURL('/tokens/alpha-token');
    await expect(
      page.getByRole('heading', { name: 'Alpha Token', level: 1 }),
    ).toBeVisible();
    await expect(page).toHaveTitle('Alpha Token Token Details | TAO');
  });

  test('shows stable loading geometry while market requests are pending', async ({
    page,
  }) => {
    await page.unrouteAll({ behavior: 'wait' });
    await mockExploreApi(page, { delayMs: 500 });
    await page.goto('/');

    await expect(page.getByLabel('Market summary loading')).toBeVisible();
    await expect(page.getByLabel('Token markets loading')).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Global market summary' }),
    ).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Token markets table' }),
    ).toBeVisible();
  });
});
