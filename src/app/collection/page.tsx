import type { Metadata } from 'next';
import CollectionPageClient from '@/components/collection-page-client';
import { fashionCategories, habitats, humanRecords, pokemon } from '@/lib/data';
import { getFashionCollectionId } from '@/lib/collection';

export const metadata: Metadata = {
  title: '내 수집 | 포코피아 가이드',
  description: '포켓몬, 서식지, 인간의 기록, 의상 보유 상태를 브라우저에 저장하고 보유/미보유로 나눠 보는 페이지입니다.',
};

export default function CollectionPage() {
  const fashionItems = fashionCategories.flatMap((category) =>
    category.items.map((item) => ({
      id: getFashionCollectionId(category.key, item.name),
      label: item.name,
      description: `${category.label}${item.unlockRecordNames.length > 0 ? ` · ${item.unlockRecordNames.join(', ')}` : ''}`,
    }))
  );

  return (
    <CollectionPageClient
      pokemon={pokemon.map((entry) => ({
        id: entry.slug,
        label: entry.name,
        number: entry.number,
        description: `${entry.primaryMap} · ${entry.primaryHabitat ?? '주 서식지 미상'}`,
        href: `/pokemon/${entry.slug}`,
      }))}
      habitats={habitats.map((entry) => ({
        id: entry.id,
        label: entry.name,
        description: `${entry.mapNames.join(' · ') || '미상'} · 연결 포켓몬 ${entry.pokemonCount}마리`,
        href: `/habitats/${entry.id}`,
      }))}
      records={humanRecords.map((entry) => ({
        id: entry.id,
        label: entry.name,
        description: `${entry.map} · ${entry.directReward ?? entry.locationDetail}`,
        href: `/records/${entry.id}`,
      }))}
      fashion={fashionItems}
    />
  );
}
