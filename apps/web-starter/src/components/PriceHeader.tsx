import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import type { TokenDetail } from '@/lib/api/contracts';

const tokenLinkIcons = [
  { label: 'X', src: '/assets/token-links/x.svg' },
  { label: 'Discord', src: '/assets/token-links/discord.svg' },
  { label: 'GitHub', src: '/assets/token-links/github.svg' },
  { label: 'Website', src: '/assets/token-links/website.svg' },
] as const;

export function PriceHeader({ token }: { token: TokenDetail }) {
  return (
    <section
      aria-labelledby="token-title"
      className="detail-page-width flex h-[140px] flex-col justify-between py-6"
    >
      <nav aria-label="Breadcrumb" className="flex h-5 items-center gap-1">
        <Link
          href="/"
          className="rounded-sm text-base font-medium leading-none text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Subnets
        </Link>
        <ChevronRight
          className="size-5 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="text-base font-medium leading-none">
          {token.subnet}
        </span>
      </nav>

      <div className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e8ff00] text-base font-semibold text-[#101014]"
            aria-hidden="true"
          >
            {token.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <h1
              id="token-title"
              className="truncate text-2xl font-medium leading-8"
            >
              {token.name}
            </h1>
            <span
              className="size-1 shrink-0 rounded-full bg-white/20"
              aria-hidden="true"
            />
            <span className="pt-1 text-lg font-medium leading-none text-muted-foreground">
              {token.subnet}
            </span>
          </div>
        </div>

        <div className="flex h-11 items-center gap-6 max-[1050px]:gap-3">
          <div
            className="flex items-center gap-1 max-[1180px]:hidden"
            aria-label="Token links preview"
          >
            {tokenLinkIcons.map((icon) => (
              <Image
                key={icon.label}
                src={icon.src}
                alt={`${icon.label} preview`}
                width={40}
                height={40}
              />
            ))}
          </div>
          <button
            type="button"
            disabled
            className="flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/8 bg-card px-6 text-sm font-medium disabled:opacity-100 max-[1100px]:px-4"
          >
            <Star className="size-4" aria-hidden="true" />
            Add to watchlist
          </button>
          <div
            className="flex h-11 items-center rounded-2xl bg-secondary p-1"
            aria-label="Currency preview"
          >
            <span className="flex h-9 items-center rounded-[14px] bg-card px-4 text-sm font-medium shadow-sm">
              USD
            </span>
            <span className="flex h-9 items-center px-4 text-sm font-medium text-muted-foreground">
              TAO
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
