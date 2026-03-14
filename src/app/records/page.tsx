import { Suspense } from 'react';
import RecordsPageClient from '@/components/records-page-client';
import { humanRecords } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '기록 | pokowiki',
  description: '포코피아 인간의 기록 126개 위치와 직접 보상, 패션 해금 정보를 정리한 페이지입니다.',
};

export default function RecordsPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">기록 목록을 불러오는 중입니다.</div>}>
      <RecordsPageClient records={humanRecords} />
    </Suspense>
  );
}
