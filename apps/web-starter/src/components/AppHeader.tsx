'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b bg-background/95">
      <div className="page-width flex h-20 items-center gap-10 max-[1100px]:gap-7">
        <Link
          href="/"
          className="shrink-0 text-[29px] font-bold tracking-[-0.07em] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label="TAO home"
        >
          tao.com
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-10 text-[15px] max-[1100px]:gap-7"
        >
          <Link
            href="/"
            className={cn(
              'relative py-7 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
              pathname === '/' &&
                'text-foreground after:absolute after:right-[-12px] after:top-1/2 after:size-1.5 after:rounded-full after:bg-primary',
            )}
          >
            Explore
          </Link>
          <span className="text-muted-foreground" aria-disabled="true">
            Swap
          </span>
          <span className="text-muted-foreground" aria-disabled="true">
            Portfolio
          </span>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative w-[270px] max-[1180px]:w-10">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Search preview"
              disabled
              placeholder="Search"
              className="h-10 rounded-xl bg-secondary pl-9 max-[1180px]:px-0 max-[1180px]:text-transparent"
            />
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-xl px-5 max-[1100px]:px-3"
            disabled
          >
            <Download className="size-4 min-[1101px]:hidden" />
            <span className="max-[1100px]:hidden">Get the app</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
