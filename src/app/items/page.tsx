import { Suspense } from 'react';
import type { Metadata } from 'next';
import ItemsPageClient from '@/components/items-page-client';
import { itemsGuideData } from '@/lib/data';

export const metadata: Metadata = {
  title: '아이템 | pokowiki',
  description: '아이템 페이지.',
};

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">아이템 데이터를 불러오는 중입니다.</div>}>
      <ItemsPageClient data={itemsGuideData} />
    </Suspense>
  );
}
