import { Suspense } from 'react';
import type { Metadata } from 'next';
import CookingPageClient from '@/components/cooking-page-client';
import { cookingGuideData } from '@/lib/data';

export const metadata: Metadata = {
  title: '요리 | pokowiki',
  description: '요리 레시피, 공물 효과, 강화 특기를 정리한 페이지.',
};

export default function CookingPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">요리 데이터를 불러오는 중입니다.</div>}>
      <CookingPageClient data={cookingGuideData} />
    </Suspense>
  );
}
