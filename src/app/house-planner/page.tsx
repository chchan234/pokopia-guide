import { Suspense } from 'react';
import type { Metadata } from 'next';
import HousePlannerClient from '@/components/house-planner-client';
import { pokemon } from '@/lib/data';

export const metadata: Metadata = {
  title: '집 추천 | pokowiki',
  description: '보유 포켓몬을 환경별 4마리 집으로 나누고, 집 수와 좋아하는 것 겹침을 함께 최적화하는 페이지입니다.',
};

export default function HousePlannerPage() {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">집 추천 데이터를 불러오는 중입니다.</div>}>
      <HousePlannerClient
        pokemon={pokemon.map((entry) => ({
          slug: entry.slug,
          number: entry.number,
          name: entry.name,
          officialName: entry.officialName,
          sourceNationalDexNo: entry.sourceNationalDexNo,
          favoriteEnvironment: entry.favoriteEnvironment,
          favoriteItems: entry.favoriteItems,
          primaryMap: entry.primaryMap,
        }))}
      />
    </Suspense>
  );
}
