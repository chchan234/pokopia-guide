import { Suspense } from 'react';
import type { Metadata } from 'next';
import DreamIslandsPageClient from '@/components/dream-islands-page-client';
import { dreamIslandsData } from '@/lib/data';

export const metadata: Metadata = {
  title: '꿈섬 | pokowiki',
  description: '꿈섬 페이지.',
};

export default function DreamIslandsPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">꿈섬 데이터를 불러오는 중입니다.</div>}>
      <DreamIslandsPageClient data={dreamIslandsData} />
    </Suspense>
  );
}
