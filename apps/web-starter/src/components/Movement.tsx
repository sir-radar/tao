import Image from 'next/image';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/format';
import { TrendArrowIcon } from './TrendArrowIcon';

export function Movement({
  value,
  compact = false,
  variant = 'default',
}: {
  value: number | null;
  compact?: boolean;
  variant?: 'default' | 'summary' | 'table';
}) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const positive = value > 0;
  const neutral = value === 0;
  const tableStyle = variant === 'table';
  const summaryStyle = variant === 'summary';
  const DirectionIcon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 whitespace-nowrap font-medium tabular',
        positive && 'text-positive',
        !positive && !neutral && 'text-negative',
        neutral && 'text-muted-foreground',
        compact && 'w-fit rounded-lg px-2 py-0.5 text-xs leading-4',
        compact && positive && 'bg-[#132a06]',
        compact && !positive && !neutral && 'bg-[#34191d]',
        compact && neutral && 'bg-secondary',
      )}
    >
      {neutral ? (
        <Minus className="size-3" aria-hidden="true" />
      ) : tableStyle ? (
        <TrendArrowIcon direction={positive ? 'up' : 'down'} />
      ) : summaryStyle ? (
        <Image
          src={`/assets/market-arrow-${positive ? 'up' : 'down'}.svg`}
          alt=""
          width={12}
          height={12}
          aria-hidden="true"
        />
      ) : (
        <DirectionIcon className="size-3" aria-hidden="true" />
      )}
      <span>
        {formatPercent(
          tableStyle || summaryStyle ? Math.abs(value) : value,
          false,
        )}
      </span>
      <span className="sr-only">
        {neutral ? 'unchanged' : positive ? 'up' : 'down'}
      </span>
    </span>
  );
}
