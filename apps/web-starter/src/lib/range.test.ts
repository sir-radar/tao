import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HISTORY_RANGE,
  isInvalidHistoryRange,
  resolveHistoryRange,
} from './range';

describe('history range URL state', () => {
  it('uses 24h when the parameter is absent', () => {
    expect(resolveHistoryRange(null)).toBe(DEFAULT_HISTORY_RANGE);
    expect(isInvalidHistoryRange(null)).toBe(false);
  });

  it('accepts every supported range exactly', () => {
    for (const range of ['1h', '24h', '7d', '30d', '90d', '1y', 'all']) {
      expect(resolveHistoryRange(range)).toBe(range);
      expect(isInvalidHistoryRange(range)).toBe(false);
    }
  });

  it('canonicalizes unsupported values to 24h', () => {
    expect(resolveHistoryRange('week')).toBe('24h');
    expect(isInvalidHistoryRange('week')).toBe(true);
  });
});
