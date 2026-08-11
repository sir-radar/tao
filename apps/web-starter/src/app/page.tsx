import { MarketSummary } from '@/components/MarketSummary';

export default function Page() {
  return (
    <main id="main" className="page-width flex-1 py-4">
      <h1 className="sr-only">Explore Tokens</h1>
      <MarketSummary />
    </main>
  );
}
