'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import OwnedToggle from '@/components/owned-toggle';
import PreserveSearchLink from '@/components/preserve-search-link';
import { useCollection } from '@/components/collection-provider';
import { isOwnershipFilter, matchesOwnershipFilter, type CollectionCategoryKey, type OwnershipFilter } from '@/lib/collection';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';

type CollectionTab = CollectionCategoryKey;

interface BaseCollectionEntry {
  id: string | number;
  label: string;
  description: string;
  href?: string;
}

interface PokemonCollectionEntry extends BaseCollectionEntry {
  id: string;
  number: string;
}

interface HabitatCollectionEntry extends BaseCollectionEntry {
  id: string;
}

interface RecordCollectionEntry extends BaseCollectionEntry {
  id: number;
}

interface FashionCollectionEntry extends BaseCollectionEntry {
  id: string;
}

interface BestshotCollectionEntry extends BaseCollectionEntry {
  id: string;
  number?: number;
  reward: string;
}

interface CategoryMeta {
  key: CollectionTab;
  label: string;
  total: number;
  owned: number;
}

interface CollectionPageClientProps {
  pokemon: PokemonCollectionEntry[];
  habitats: HabitatCollectionEntry[];
  records: RecordCollectionEntry[];
  fashion: FashionCollectionEntry[];
  bestshots: BestshotCollectionEntry[];
}

const tabLabels: Record<CollectionTab, string> = {
  pokemon: '포켓몬',
  habitats: '서식지',
  records: '기록',
  fashion: '의상',
  bestshots: '베스트샷',
};

function isCollectionTab(value: string | null): value is CollectionTab {
  return value !== null && ['pokemon', 'habitats', 'records', 'fashion', 'bestshots'].includes(value);
}

export default function CollectionPageClient({ pokemon, habitats, records, fashion, bestshots }: CollectionPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const queryTab = searchParams.get('tab');
  const queryOwned = searchParams.get('owned');
  const [activeTab, setActiveTab] = useState<CollectionTab>(isCollectionTab(queryTab) ? queryTab : 'pokemon');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>(isOwnershipFilter(queryOwned) ? queryOwned : 'all');
  const [search, setSearch] = useState(querySearch);
  const { hydrated, pokemonOwnedSet, habitatOwnedSet, recordOwnedSet, fashionOwnedSet, bestshotOwnedSet, togglePokemon, toggleHabitat, toggleRecord, toggleFashion, toggleBestshot } =
    useCollection();

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
    if (!isCollectionTab(queryTab)) {
      setActiveTab('pokemon');
      return;
    }

    setActiveTab(queryTab);
  }, [queryTab]);

  useEffect(() => {
    if (isOwnershipFilter(queryOwned)) {
      setOwnershipFilter(queryOwned);
      return;
    }

    setOwnershipFilter('all');
  }, [queryOwned]);

  const syncedParams = useMemo(
    () => ({
      q: search,
      tab: activeTab === 'pokemon' ? undefined : activeTab,
      owned: ownershipFilter === 'all' ? undefined : ownershipFilter,
    }),
    [activeTab, ownershipFilter, search]
  );

  useSyncQueryParams(syncedParams);

  const categories = useMemo(
    (): CategoryMeta[] => [
      { key: 'pokemon', label: tabLabels.pokemon, total: pokemon.length, owned: pokemon.filter((entry) => pokemonOwnedSet.has(entry.id)).length },
      {
        key: 'habitats',
        label: tabLabels.habitats,
        total: habitats.length,
        owned: habitats.filter((entry) => habitatOwnedSet.has(entry.id)).length,
      },
      { key: 'records', label: tabLabels.records, total: records.length, owned: records.filter((entry) => recordOwnedSet.has(entry.id)).length },
      { key: 'fashion', label: tabLabels.fashion, total: fashion.length, owned: fashion.filter((entry) => fashionOwnedSet.has(entry.id)).length },
      { key: 'bestshots', label: tabLabels.bestshots, total: bestshots.length, owned: bestshots.filter((entry) => bestshotOwnedSet.has(entry.id)).length },
    ],
    [bestshots, bestshotOwnedSet, fashion, fashionOwnedSet, habitatOwnedSet, habitats, pokemon, pokemonOwnedSet, recordOwnedSet, records]
  );

  const activeCategory = categories.find((entry) => entry.key === activeTab) ?? categories[0];

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (activeTab === 'pokemon') {
      return pokemon.filter((entry) => {
        const owned = pokemonOwnedSet.has(entry.id);
        return (
          matchesOwnershipFilter(owned, ownershipFilter) &&
          (query.length === 0 ||
            entry.label.toLowerCase().includes(query) ||
            entry.number.includes(query) ||
            entry.description.toLowerCase().includes(query))
        );
      });
    }

    if (activeTab === 'habitats') {
      return habitats.filter((entry) => {
        const owned = habitatOwnedSet.has(entry.id);
        return (
          matchesOwnershipFilter(owned, ownershipFilter) &&
          (query.length === 0 || entry.label.toLowerCase().includes(query) || entry.description.toLowerCase().includes(query))
        );
      });
    }

    if (activeTab === 'records') {
      return records.filter((entry) => {
        const owned = recordOwnedSet.has(entry.id);
        return (
          matchesOwnershipFilter(owned, ownershipFilter) &&
          (query.length === 0 ||
            entry.label.toLowerCase().includes(query) ||
            entry.description.toLowerCase().includes(query) ||
            String(entry.id).includes(query))
        );
      });
    }

    if (activeTab === 'fashion') {
      return fashion.filter((entry) => {
        const owned = fashionOwnedSet.has(entry.id);
        return (
          matchesOwnershipFilter(owned, ownershipFilter) &&
          (query.length === 0 || entry.label.toLowerCase().includes(query) || entry.description.toLowerCase().includes(query))
        );
      });
    }

    return bestshots.filter((entry) => {
      const owned = bestshotOwnedSet.has(entry.id);
      return (
        matchesOwnershipFilter(owned, ownershipFilter) &&
        (query.length === 0 ||
          entry.label.toLowerCase().includes(query) ||
          entry.description.toLowerCase().includes(query) ||
          String(entry.number).includes(query))
      );
    });
  }, [
    activeTab,
    bestshots,
    bestshotOwnedSet,
    fashion,
    fashionOwnedSet,
    habitatOwnedSet,
    habitats,
    ownershipFilter,
    pokemon,
    pokemonOwnedSet,
    recordOwnedSet,
    records,
    search,
  ]);

  function isOwned(tab: CollectionTab, id: string | number) {
    if (tab === 'pokemon') {
      return pokemonOwnedSet.has(id as string);
    }

    if (tab === 'habitats') {
      return habitatOwnedSet.has(id as string);
    }

    if (tab === 'records') {
      return recordOwnedSet.has(id as number);
    }

    if (tab === 'fashion') {
      return fashionOwnedSet.has(id as string);
    }

    return bestshotOwnedSet.has(id as string);
  }

  function toggleOwned(tab: CollectionTab, id: string | number) {
    if (tab === 'pokemon') {
      togglePokemon(id as string);
      return;
    }

    if (tab === 'habitats') {
      toggleHabitat(id as string);
      return;
    }

    if (tab === 'records') {
      toggleRecord(id as number);
      return;
    }

    if (tab === 'fashion') {
      toggleFashion(id as string);
      return;
    }

    toggleBestshot(id as string);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">내 수집</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          포켓몬, 서식지, 기록, 의상, 베스트샷을 브라우저에 저장하고 보유/미보유 상태로 나눠 볼 수 있습니다.
        </p>
        {!hydrated && <p className="mt-2 text-xs text-muted-foreground">브라우저 저장된 체크 상태를 불러오는 중입니다.</p>}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {categories.map((category) => {
          const missing = category.total - category.owned;
          const isActive = category.key === activeTab;

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveTab(category.key)}
              className={`rounded-3xl border p-5 text-left transition-colors ${
                isActive ? 'border-pk-green bg-pk-green-light/35' : 'border-border bg-card hover:border-pk-green/50'
              }`}
            >
              <div className="text-sm font-bold text-foreground">{category.label}</div>
              <div className="mono mt-2 text-2xl font-bold text-pk-green-dark">
                {category.owned}
                <span className="text-sm text-muted-foreground"> / {category.total}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">미보유 {missing}개</p>
            </button>
          );
        })}
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            placeholder={`${activeCategory.label} 이름으로 검색`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: '전체' },
              { key: 'owned', label: '보유만' },
              { key: 'missing', label: '미보유만' },
            ].map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setOwnershipFilter(filter.key as OwnershipFilter)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  ownershipFilter === filter.key
                    ? 'bg-pk-green text-white'
                    : 'border border-border bg-background text-foreground hover:border-pk-green'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          <span className="mono font-semibold text-foreground">{filteredItems.length}</span>
          {ownershipFilter !== 'all' || search ? ` / ${activeCategory.total}` : ''}개
        </p>

        <div className="space-y-3">
          {filteredItems.map((item) => {
            const owned = isOwned(activeTab, item.id);
            const key = `${activeTab}-${String(item.id)}`;
            const pokemonNumber = activeTab === 'pokemon' ? (item as PokemonCollectionEntry).number : null;
            const bestshotNumber = activeTab === 'bestshots' ? (item as BestshotCollectionEntry).number : null;
            const bestshotReward = activeTab === 'bestshots' ? (item as BestshotCollectionEntry).reward : null;

            return (
              <article
                key={key}
                className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background p-4"
                style={{ contentVisibility: 'auto' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {activeTab === 'records' && (
                      <span className="mono text-[11px] text-muted-foreground">#{String(item.id).padStart(3, '0')}</span>
                    )}
                    {pokemonNumber && <span className="mono text-[11px] text-muted-foreground">#{pokemonNumber}</span>}
                    {bestshotNumber && <span className="mono text-[11px] text-muted-foreground">#{String(bestshotNumber).padStart(2, '0')}</span>}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        owned ? 'bg-pk-green-light text-pk-green-dark' : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      {owned ? '보유' : '미보유'}
                    </span>
                  </div>

                  {item.href ? (
                    <PreserveSearchLink href={item.href} className="mt-2 block text-base font-bold text-foreground hover:text-pk-green-dark">
                      {item.label}
                    </PreserveSearchLink>
                  ) : (
                    <h2 className="mt-2 text-base font-bold text-foreground">{item.label}</h2>
                  )}

                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  {bestshotReward && bestshotReward !== '없음' && (
                    <p className="mt-1 text-xs font-medium text-pk-green-dark">{bestshotReward}</p>
                  )}
                </div>

                <OwnedToggle owned={owned} onToggle={() => toggleOwned(activeTab, item.id)} />
              </article>
            );
          })}
        </div>

        {filteredItems.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 항목이 없습니다.</div>}
      </section>
    </div>
  );
}
