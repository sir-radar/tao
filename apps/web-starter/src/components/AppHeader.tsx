'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();
  const exploreActive = pathname === '/' || pathname.startsWith('/tokens/');
  return (
    <header className="h-[72px] border-b border-white/8 bg-background">
      <div className="page-width flex h-full items-center">
        <div className="flex items-center gap-14 max-[900px]:gap-6">
          <Link
            href="/"
            className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            aria-label="TAO home"
          >
            <Image
              src="/assets/tao-logo.svg"
              alt="TAO.com"
              width={112}
              height={20}
              priority
            />
          </Link>
          <nav
            aria-label="Primary"
            className="flex h-[26px] items-center gap-2 text-lg font-medium"
          >
            <Link
              href="/"
              className={cn(
                'flex h-[26px] w-[100px] items-end gap-2 px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
                exploreActive && 'text-foreground',
              )}
            >
              Explore
              {exploreActive && (
                <span
                  className="mb-[6px] size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </Link>
            <span
              className="flex h-[26px] w-[84px] items-end justify-center px-3 text-muted-foreground"
              aria-disabled="true"
            >
              Swap
            </span>
            <span
              className="flex h-[26px] w-[108px] items-end justify-center px-3 text-muted-foreground max-[900px]:hidden"
              aria-disabled="true"
            >
              Portfolio
            </span>
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div
            className="flex h-10 w-[270px] items-center gap-2.5 rounded-2xl bg-secondary px-4 text-sm text-muted-foreground max-[1260px]:size-9 max-[1260px]:justify-center max-[1260px]:border max-[1260px]:border-white/8 max-[1260px]:bg-black/20 max-[1260px]:px-0"
            aria-label="Search preview"
            aria-disabled="true"
          >
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="max-[1260px]:hidden">Search</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="flex h-10 w-[122px] items-center justify-center rounded-[14px] border border-white/20 text-base font-medium text-foreground transition-colors hover:border-white/30 disabled:opacity-100"
            >
              Download
            </button>
            <button
              type="button"
              disabled
              className="flex h-10 w-36 items-center justify-center gap-2 whitespace-nowrap rounded-[14px] bg-primary px-3 text-sm font-medium text-secondary disabled:opacity-100 max-[900px]:hidden"
              aria-label="Wallet preview: 1 wallet"
            >
              <span
                className="flex h-6 w-[42px] items-center"
                aria-hidden="true"
              >
                <span className="relative z-10 flex size-6 items-center justify-center rounded-full border border-black/5 bg-white text-[13px] font-semibold text-black">
                  τ
                </span>
                <span className="-ml-1.5 flex size-6 items-center justify-center rounded-full border-2 border-primary bg-secondary text-foreground">
                  <Plus className="size-4" />
                </span>
              </span>
              <span>1 wallet</span>
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
