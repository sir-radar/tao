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
    const scrollRegion = screen.getByRole('region', {
      name: /token markets table/i,
    });
    Object.defineProperties(scrollRegion, {
      clientWidth: { configurable: true, value: 500 },
      scrollWidth: { configurable: true, value: 1500 },
    });
    fireEvent.keyDown(scrollRegion, { key: 'ArrowRight' });
    expect(scrollRegion.scrollLeft).toBe(350);
    fireEvent.keyDown(scrollRegion, { key: 'End' });
    expect(scrollRegion.scrollLeft).toBe(1000);
    fireEvent.keyDown(scrollRegion, { key: 'Home' });
    expect(scrollRegion.scrollLeft).toBe(0);
    expect(screen.getByText('1.25%')).toBeInTheDocument();
    expect(screen.queryByText('-1.25%')).not.toBeInTheDocument();
    const downArrow = container.querySelector('svg[data-trend-arrow="down"]');
    const upArrow = container.querySelector('svg[data-trend-arrow="up"]');
    expect(downArrow).toBeInTheDocument();
    expect(downArrow?.querySelector('path')).toHaveAttribute('fill', '#FF7D78');
    expect(upArrow?.querySelector('path')).toHaveAttribute('fill', '#5FC41F');
    const emissionsCell = screen.getByRole('cell', {
      name: /0\.55 tao per day/i,
    });
    expect(
      emissionsCell.querySelector('svg[data-trend-arrow="up"]'),
    ).toBeInTheDocument();

    expect(screen.getByText('4342')).toBeInTheDocument();
    expect(screen.queryByText('4,342')).not.toBeInTheDocument();

    const moreButton = screen.getByRole('button', {
      name: /more actions for alpha token/i,
    });
    expect(moreButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(moreButton);
    expect(moreButton).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu', {
      name: /actions for alpha token/i,
    });
    expect(menu).toHaveClass('top-[46px]', 'right-[-6px]');

    fireEvent.click(moreButton);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
