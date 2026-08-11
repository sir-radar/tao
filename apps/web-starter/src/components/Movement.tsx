import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/format';

export function Movement({
  value,
  compact = false,
  variant = 'default',
}: {
  value: number | null;
  compact?: boolean;
  variant?: 'default' | 'table';
}) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const positive = value > 0;
  const neutral = value === 0;
  const tableStyle = variant === 'table';
  const DirectionIcon = positive ? ArrowUpRight : ArrowDownRight;
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
      {neutral ? (
        <Minus className="size-3" aria-hidden="true" />
      ) : tableStyle ? (
        <Image
          src={positive ? '/icons/arrow-up-01.svg' : '/icons/arrow-down-01.svg'}
          alt=""
          width={16}
          height={16}
          unoptimized
          aria-hidden="true"
        />
      ) : (
        <DirectionIcon className="size-3" aria-hidden="true" />
      )}
      <span>{formatPercent(tableStyle ? Math.abs(value) : value, false)}</span>
      <span className="sr-only">
        {neutral ? 'unchanged' : positive ? 'up' : 'down'}
      </span>
    </span>
  );
}
