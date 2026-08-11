import { HISTORY_RANGES, type HistoryRange } from '@/lib/api/contracts';

export const DEFAULT_HISTORY_RANGE: HistoryRange = '24h';

export function resolveHistoryRange(value: string | null): HistoryRange {
  return value && (HISTORY_RANGES as readonly string[]).includes(value)
    ? (value as HistoryRange)
    : DEFAULT_HISTORY_RANGE;
}

export function isInvalidHistoryRange(value: string | null) {
  return value !== null && resolveHistoryRange(value) !== value;
}
