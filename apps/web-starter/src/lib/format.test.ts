import { describe, expect, it } from 'vitest';
import { formatCurrencyCompact, formatPrice } from './format';

describe('market formatters', () => {
  it('places the sign before compact currency values', () => {
    expect(formatCurrencyCompact(-2_801.47)).toMatch(/^\-\$/);
  });

  it('retains meaningful precision for small prices', () => {
    expect(formatPrice(0.00123456)).toBe('$0.00123456');
    expect(formatPrice(null)).toBe('—');
  });
});
