import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/format';
export function Movement({
  value,
  compact = false,
}: {
  value: number | null;
  compact?: boolean;
}) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const positive = value > 0;
  const neutral = value === 0;
  const Icon = neutral ? Minus : positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 whitespace-nowrap font-medium tabular',
        positive && 'text-positive',
        !positive && !neutral && 'text-negative',
        neutral && 'text-muted-foreground',
        compact && 'w-fit rounded-md bg-current/10 px-1.5 py-0.5 text-xs',
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span>{formatPercent(value, false)}</span>
      <span className="sr-only">
        {neutral ? 'unchanged' : positive ? 'up' : 'down'}
      </span>
    </span>
  );
}
