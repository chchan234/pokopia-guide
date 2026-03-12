import type { Metadata } from 'next';
import HousePlannerClient from '@/components/house-planner-client';
import { pokemon } from '@/lib/data';

export const metadata: Metadata = {
  title: '집 추천 | pokowiki',
  description: '보유 포켓몬을 환경별 4마리 집으로 나누고, 집 수와 좋아하는 것 겹침을 함께 최적화하는 페이지입니다.',
};

export default function HousePlannerPage() {
  return (
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
  );
}
