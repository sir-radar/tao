import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarketSummary } from './MarketSummary';

afterEach(() => vi.unstubAllGlobals());

describe('MarketSummary', () => {
  it('reserves the ratio label for the ratio metric when movement is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            marketCap: 100,
            marketCapChangePercent24h: 2,
            volume24h: 50,
            volumeToMarketCapPercent: 50,
            dailyTrades: 10,
            dailyTraders: 5,
            activeWallets: 3,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MarketSummary />
      </QueryClientProvider>,
    );

    const ratio = await screen.findByText('24H ratio');
    expect(ratio).toBeInTheDocument();
    expect(screen.getAllByText('24H ratio')).toHaveLength(1);
    const volumeCard = screen
      .getByText('Volume (24h)')
      .closest('[data-slot="card"]');
    expect(volumeCard).not.toBeNull();
    expect(
      within(volumeCard as HTMLElement).getByText('—'),
    ).toBeInTheDocument();
    expect(
      within(volumeCard as HTMLElement).queryByText('24H ratio'),
    ).not.toBeInTheDocument();
  });
});
