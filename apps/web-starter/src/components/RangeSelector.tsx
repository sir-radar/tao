'use client';

import {
  HISTORY_RANGES,
  RANGE_LABELS,
  type HistoryRange,
} from '@/lib/api/contracts';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function RangeSelector({
  value,
  onValueChange,
}: {
  value: HistoryRange;
  onValueChange: (range: HistoryRange) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      spacing={0}
      aria-label="Price history range"
      className="rounded-xl bg-secondary p-1"
      onValueChange={(next) => {
        if (next) onValueChange(next as HistoryRange);
      }}
    >
      {HISTORY_RANGES.map((range) => (
        <ToggleGroupItem
          key={range}
          value={range}
          aria-label={`${RANGE_LABELS[range]} price range`}
          className="h-7 min-w-9 rounded-lg px-2 text-[11px] text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-foreground"
        >
          {RANGE_LABELS[range]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
