import { Suspense } from 'react';
import type { Metadata } from 'next';
import GuidesPageClient from '@/components/guides-page-client';
import { guideDocs } from '@/lib/guides';

export const metadata: Metadata = {
  title: '공략 | pokowiki',
  description: '스토리, 초보자 팁, 건축/환경, 이벤트처럼 데이터형 페이지를 보완하는 공략 문서를 정리한 허브 페이지.',
};

export default function GuidesPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">공략 문서를 불러오는 중입니다.</div>}>
      <GuidesPageClient docs={guideDocs} />
    </Suspense>
  );
}
