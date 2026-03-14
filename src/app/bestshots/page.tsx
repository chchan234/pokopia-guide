import { Suspense } from 'react';
import type { Metadata } from 'next';
import BestshotsPageClient from '@/components/bestshots-page-client';
import { itemsGuideData } from '@/lib/data';

export const metadata: Metadata = {
  title: '베스트샷 | pokowiki',
  description: '베스트샷 44개의 조건, 필요 포켓몬, 아이템, 보상을 확인할 수 있습니다.',
};

export default function BestshotsPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">베스트샷 데이터를 불러오는 중입니다.</div>}>
      <BestshotsPageClient bestshots={itemsGuideData.bestshots} />
    </Suspense>
  );
}
