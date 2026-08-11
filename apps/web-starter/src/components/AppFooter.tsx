'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppFooter() {
  const detailView = usePathname().startsWith('/tokens/');
  return (
    <footer
      className={cn(
        'mt-auto flex shrink-0 items-start justify-between gap-8 text-sm leading-5 text-muted-foreground',
        detailView
          ? 'detail-footer detail-page-width'
          : 'page-width h-[84px] py-8',
      )}
    >
      <span>© 2026 TAO.com – All rights reserved.</span>
      <span className="flex items-center gap-3 text-right">
        <span>API Documentation</span>
        <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
        <span>Privacy Policy</span>
        <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
        <span>Terms of Use</span>
        <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
        <span>Support</span>
      </span>
    </footer>
  );
}
