import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TokenDetail, TokenStats } from '@/lib/api/contracts';
import { StatsSections } from './StatsSections';

const token: TokenDetail = {
  id: 'gradients',
  name: 'Gradients',
  symbol: 'GRAD',
  subnet: 'SN56',
  currency: 'USD',
  price: 5.67,
  change24h: 0.12,
  changePercent24h: 2.1,
  marketCap: 100_000,
  circulatingSupply: 20_000,
  maxSupply: 30_000,
  netVolume24h: 5_000,
  traders24h: 10,
  lastUpdated: '2026-06-05T10:30:00.000Z',
};

const stats: TokenStats = {
  id: token.id,
  name: token.name,
  symbol: token.symbol,
  subnet: token.subnet,
  range: '24h',
  generatedAt: token.lastUpdated,
  price: {
    open: 5.5,
    close: 5.67,
    high: 5.8,
    low: 5.4,
    change: 0.17,
    changePercent: 3.09,
    allTimeHigh: {
      timestamp: '2026-06-01T00:00:00.000Z',
      time: 1_780_272_000,
      price: 8.14,
    },
    allTimeLow: {
      timestamp: '2026-04-02T00:00:00.000Z',
      time: 1_775_088_000,
      price: 0.01,
    },
  },
  financials: {
    marketCap: 100_000,
    fullyDilutedValue: 150_000,
    mcFdvRatio: 0.67,
    circulatingSupply: 20_000,
    totalSupply: 25_000,
    maxSupply: 30_000,
    totalStaked: 12_000,
    averageStakeApy: 7.22,
  },
  trading: {
    totalVolume: 10_000,
    netVolume: 2_000,
    buyVolume: 6_000,
    sellVolume: 4_000,
    transactions: 1_000,
    traders: 72,
    totalBuys: 750,
    totalSells: 250,
    uniqueBuyers: 44,
    uniqueSellers: 56,
  },
  subnetData: {
    emissionsPerDay: 2.81,
    incentiveBurn: 1,
    registrationCost: 0.1,
    activeValidators: 46,
    activeMiners: 100,
    registeredKeys: 256,
    keyCapacity: 256,
    registeredAt: '2024-08-06T00:00:00.000Z',
    nextHalving: '2028-03-08T00:00:00.000Z',
  },
};

describe('StatsSections', () => {
  it('uses the supplied movement assets and renders split trading bars', () => {
    const { container, rerender } = render(
      <StatsSections
        token={token}
        selectedRange="24h"
        displayed={stats}
        isInitialLoading={false}
        isUpdating={false}
        error={null}
        onRetry={() => undefined}
      />,
    );

    expect(
      container.querySelector('img[src*="market-arrow-up.svg"]'),
    ).toBeInTheDocument();

    const tradingPanel = screen
      .getByRole('heading', { name: 'Trading volume' })
      .closest('div.rounded-2xl');
    expect(tradingPanel).not.toBeNull();
    expect(
      within(tradingPanel as HTMLElement)
        .getByText('Net volume')
        .closest('div')
        ?.querySelector('img[src*="trading/arrow-up-01.svg"]'),
    ).toBeInTheDocument();

    const priceChange = screen.getByText('Price change (24H)').closest('div');
    expect(
      priceChange?.querySelector('img[src*="trading/arrow-up-01.svg"]'),
    ).toBeInTheDocument();

    const highlightsPanel = screen
      .getByRole('heading', { name: 'Highlights (24H)' })
      .closest('div.rounded-2xl');
    expect(
      within(highlightsPanel as HTMLElement)
        .getAllByText('Market cap')[0]
        .closest('div')
        ?.querySelector('dd'),
    ).toHaveClass('text-xl', 'leading-5');
    expect(
      within(tradingPanel as HTMLElement).getByText('Net volume'),
    ).toHaveClass('border-dashed');
    expect(
      within(tradingPanel as HTMLElement)
        .getByText('Net volume')
        .closest('div'),
    ).toHaveClass('items-end', 'text-right');
    expect(
      within(tradingPanel as HTMLElement).getByText('USD').parentElement,
    ).toHaveClass('h-9', 'w-[95px]');

    const volumeBar = screen.getByRole('img', {
      name: 'Volume: 60% buy and 40% sell',
    });
    expect(volumeBar.children).toHaveLength(2);
    expect(volumeBar.children[0]).toHaveClass('bg-positive');
    expect(volumeBar.children[1]).toHaveClass('bg-negative');

    rerender(
      <StatsSections
        token={{ ...token, changePercent24h: -2.1 }}
        selectedRange="24h"
        displayed={{
          ...stats,
          price: { ...stats.price, changePercent: -3.09 },
          trading: { ...stats.trading, netVolume: -2_000 },
        }}
        isInitialLoading={false}
        isUpdating={false}
        error={null}
        onRetry={() => undefined}
      />,
    );

    expect(
      container.querySelector('img[src*="market-arrow-down.svg"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('img[src*="trading/arrow-down-01.svg"]'),
    ).toHaveLength(2);
  });
});
