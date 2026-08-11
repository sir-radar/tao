export function AppFooter() {
  return (
    <footer className="page-width mt-auto flex h-[84px] shrink-0 items-start justify-between gap-8 py-8 text-sm leading-5 text-muted-foreground">
      <span>© 2026 TAO.com — All rights reserved.</span>
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
