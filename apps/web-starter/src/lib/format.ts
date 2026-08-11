import type { NullableNumber } from './api/contracts';

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const ungroupedInteger = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  useGrouping: false,
});
const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
});

export function formatCompact(value: NullableNumber, prefix = '') {
  return value === null ? '—' : `${prefix}${compact.format(value)}`;
}
export function formatInteger(value: NullableNumber) {
  return value === null ? '—' : integer.format(value);
}
export function formatIntegerUngrouped(value: NullableNumber) {
  return value === null ? '—' : ungroupedInteger.format(value);
}
export function formatCurrencyCompact(value: NullableNumber) {
  return value === null ? '—' : compactCurrency.format(value);
}
export function formatDecimal(
  value: NullableNumber,
  maximumFractionDigits = 2,
) {
  return value === null
    ? '—'
    : new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value);
}
export function formatPrice(value: NullableNumber) {
  if (value === null) return '—';
  const decimals =
    value >= 100
      ? 2
      : value >= 1
        ? 4
        : value >= 0.1
          ? 5
          : value >= 0.01
            ? 6
            : 8;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(value);
}
export function formatPercent(value: NullableNumber, signed = true) {
  if (value === null) return '—';
  const sign = signed && value > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}%`;
}
export function formatRatio(value: NullableNumber) {
  return value === null
    ? '—'
    : new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(
        value,
      );
}
export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      }).format(new Date(value))
    : '—';
}
export function formatUpdated(value: string | null) {
  return value
    ? `${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(value))} UTC`
    : 'Update time unavailable';
}
