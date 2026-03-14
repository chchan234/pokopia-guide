import { Suspense } from 'react';
import HabitatsPageClient from '@/components/habitats-page-client';
import { habitats } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서식지 | pokowiki',
  description: '포코피아 서식지 212개를 이미지와 연결 포켓몬 기준으로 정리한 페이지입니다.',
};

export default function HabitatsPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">서식지 목록을 불러오는 중입니다.</div>}>
      <HabitatsPageClient habitats={habitats} />
    </Suspense>
  );
}
