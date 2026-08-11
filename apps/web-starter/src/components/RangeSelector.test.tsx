import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RangeSelector } from './RangeSelector';

afterEach(cleanup);

describe('RangeSelector', () => {
  it('exposes all ranges and reports the selected value', () => {
    const onValueChange = vi.fn();
    render(<RangeSelector value="24h" onValueChange={onValueChange} />);

    expect(
      screen.getByRole('radiogroup', { name: 'Price history range' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(7);
    expect(
      screen.getByRole('radio', { name: '24H price range' }),
    ).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('radio', { name: '1Y price range' }));
    expect(onValueChange).toHaveBeenCalledWith('1y');
  });

  it('supports keyboard activation', () => {
    const onValueChange = vi.fn();
    render(<RangeSelector value="24h" onValueChange={onValueChange} />);

    fireEvent.keyDown(screen.getByRole('radio', { name: '1Y price range' }), {
      key: 'Enter',
    });

    expect(onValueChange).toHaveBeenCalledWith('1y');
  });
});
