import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TokenDetail } from '@/lib/api/contracts';
import { ChartPanel } from './ChartPanel';

const token: TokenDetail = {
  id: 'gradients',
  name: 'Gradients',
  symbol: 'SN56',
  subnet: 'SN56',
  currency: 'USD',
  price: 5.67,
  change24h: 0.12,
  changePercent24h: 2.1,
  marketCap: 100,
  circulatingSupply: 20,
  maxSupply: 30,
  netVolume24h: 5,
  traders24h: 10,
  lastUpdated: '2026-06-05T10:30:00.000Z',
};

const panelProps = {
  selectedRange: '24h' as const,
  displayed: null,
  symbol: 'SN56',
  isInitialLoading: true,
  isUpdating: false,
  error: null,
  onRangeChange: () => undefined,
  onRetry: () => undefined,
};

describe('ChartPanel', () => {
  it('renders the featured price hierarchy and directional movement assets', () => {
    const { container, rerender } = render(
      <ChartPanel token={token} {...panelProps} />,
    );

    const price = screen.getByLabelText('Current price: $5.67');
    expect(price.querySelector('[data-slot="price-currency"]')).toHaveClass(
      'text-[36px]',
      'text-muted-foreground',
    );
    expect(price.querySelector('[data-slot="price-integer"]')).toHaveClass(
      'text-[48px]',
    );
    expect(price.querySelector('[data-slot="price-fraction"]')).toHaveClass(
      'text-[36px]',
    );
    expect(
      container.querySelector('img[src*="arrow-up-01.svg"]'),
    ).toBeInTheDocument();

    rerender(
      <ChartPanel
        token={{ ...token, changePercent24h: -2.1 }}
        {...panelProps}
      />,
    );

    expect(
      container.querySelector('img[src*="arrow-down-01.svg"]'),
    ).toBeInTheDocument();
  });
});
