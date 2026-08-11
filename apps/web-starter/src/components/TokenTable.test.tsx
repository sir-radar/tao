import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TokenListItem } from '@/lib/api/contracts';
import { TokenTable } from './TokenTable';

const sample: TokenListItem = {
  id: 'alpha-token',
  name: 'Alpha Token',
  symbol: 'ALPHA',
  subnet: 'SN42',
  price: 0.00123456,
  marketCap: 12_000_000,
  changePercent24h: 2.5,
  changePercent7d: -1.25,
  changePercent30d: 8.1,
  netVolume24h: -2_801.47,
  buyVolume24h: 10_125.31,
  sellVolume24h: 12_926.78,
  transactions24h: 4_342,
  emissionsPerDay: 0.55,
};

describe('TokenTable', () => {
  it('exposes semantic sorting and an accessible token route', () => {
    const onSort = vi.fn();
    const { container } = render(
      <TokenTable
        tokens={[sample]}
        sortKey="marketCap"
        direction="desc"
        onSort={onSort}
      />,
    );

    const marketCapHeader = screen.getByRole('columnheader', {
      name: /market cap/i,
    });
    expect(marketCapHeader).toHaveAttribute('aria-sort', 'descending');
    expect(
      screen.getByRole('columnheader', { name: /price 24h/i }),
    ).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(within(marketCapHeader).getByRole('button'));
    expect(onSort).toHaveBeenCalledWith('marketCap');

    expect(screen.getByRole('link', { name: /alpha token/i })).toHaveAttribute(
      'href',
      '/tokens/alpha-token',
    );
    expect(
      screen.getByRole('region', { name: /token markets table/i }),
    ).toHaveAttribute('tabindex', '0');
    expect(screen.getByText('1.25%')).toBeInTheDocument();
    expect(screen.queryByText('-1.25%')).not.toBeInTheDocument();
    expect(
      container.querySelector('img[src="/icons/arrow-down-01.svg"]'),
    ).toBeInTheDocument();
  });
});
