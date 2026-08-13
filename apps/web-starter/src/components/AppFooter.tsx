'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppFooter() {
  const detailView = usePathname().startsWith('/tokens/');
  return (
    <footer
      className={cn(
        'mt-auto flex shrink-0 items-start justify-between gap-8 text-sm font-[430] leading-5 text-muted-foreground',
        detailView
          ? 'detail-footer detail-page-width'
          : 'page-width h-[84px] py-8',
      )}
    >
      <span
        className={cn(
          !detailView &&
            'w-[236px] shrink-0 whitespace-nowrap tracking-[-0.4px]',
        )}
      >
        © 2026 TAO.com – All rights reserved.
      </span>
      <span
        className={cn(
          'flex items-center gap-3 text-right',
          !detailView && 'w-[424px] shrink-0 justify-center',
        )}
      >
        <span className={cn(!detailView && 'w-[122px] whitespace-nowrap')}>
          API Documentation
        </span>
        <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
        <span className={cn(!detailView && 'w-[85px] whitespace-nowrap')}>
          Privacy Policy
        </span>
        <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
        <span className={cn(!detailView && 'w-[81px] whitespace-nowrap')}>
          Terms of Use
        </span>
        <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
        <span className={cn(!detailView && 'w-[52px] whitespace-nowrap')}>
          Support
        </span>
      </span>
    </footer>
  );
}
