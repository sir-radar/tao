import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TokenDetail } from '@/lib/api/contracts';
import { TradingRail } from './TradingRail';

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

describe('TradingRail', () => {
  it('keeps every trading control disabled and exposes preview context', () => {
    render(<TradingRail token={token} />);

    expect(screen.getByText('Preview only')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeDisabled();
    expect(screen.getByLabelText('Sell amount')).toBeDisabled();
    expect(screen.getByLabelText('Buy amount')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Enter an amount' }),
    ).toBeDisabled();
  });
});
