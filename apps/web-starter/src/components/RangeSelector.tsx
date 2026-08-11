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
      className="h-11 w-[380px] rounded-2xl bg-secondary p-1 max-[1350px]:w-[350px] max-[1100px]:w-[320px]"
      onValueChange={(next) => {
        if (next) onValueChange(next as HistoryRange);
      }}
    >
      {HISTORY_RANGES.map((range) => (
        <ToggleGroupItem
          key={range}
          value={range}
          aria-label={`${RANGE_LABELS[range]} price range`}
          className="h-9 min-w-0 flex-1 rounded-[14px] px-2 text-sm font-medium text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-sm"
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            onValueChange(range);
          }}
        >
          {RANGE_LABELS[range]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
