import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  TokenDetailPage,
  TokenDetailSkeleton,
} from '@/components/TokenDetailPage';

export const metadata: Metadata = {
  title: 'Token Details',
  description: 'TAO subnet token price history and market statistics.',
};

export default async function Page({ params }: PageProps<'/tokens/[id]'>) {
  const { id } = await params;
  return (
    <Suspense fallback={<TokenDetailSkeleton />}>
      <TokenDetailPage id={id} />
    </Suspense>
  );
}
