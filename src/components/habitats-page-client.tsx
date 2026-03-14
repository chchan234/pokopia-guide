'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CollectionToggleButton from '@/components/collection-toggle-button';
import PreserveSearchLink from '@/components/preserve-search-link';
import ZoomableImage from '@/components/zoomable-image';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import type { Habitat } from '@/types/pokemon';

interface HabitatsPageClientProps {
  habitats: Habitat[];
}

export default function HabitatsPageClient({ habitats }: HabitatsPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const filteredHabitats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return habitats;
    }

    return habitats.filter((habitat) =>
      [
        habitat.name,
        habitat.nameJp,
        habitat.number,
        ...habitat.mapNames,
        ...habitat.requirementsKo,
        ...habitat.requirementsJp,
        ...habitat.pokemonEntries.map((entry) => entry.name),
        ...habitat.pokemonEntries.map((entry) => entry.number),
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [habitats, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">서식지</h1>
        <p className="mt-1 text-sm text-muted-foreground">총 {habitats.length}개 서식지</p>
        <p className="mt-1 text-sm text-pk-brown-dark/80">서식지 사진을 클릭하면 확대해서 볼 수 있습니다.</p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="서식지명, 번호, 지역, 필요 재료, 포켓몬으로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            <span className="mono font-semibold text-foreground">{filteredHabitats.length}</span>
            {search.trim() ? ` / ${habitats.length}` : ''}개
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredHabitats.map((habitat) => (
          <section key={habitat.id} id={habitat.id} className="scroll-mt-20 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex gap-4 p-5">
              <div className="flex h-[96px] w-[96px] flex-shrink-0 items-center justify-center rounded-2xl bg-pk-green-light/40">
                {habitat.imagePath ? (
                  <ZoomableImage
                    src={habitat.imagePath}
                    alt={habitat.name}
                    width={84}
                    height={84}
                    className="object-contain"
                    buttonClassName="inline-flex cursor-zoom-in items-center justify-center"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground sm:text-[11px]">이미지 없음</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {habitat.number && <p className="mono text-xs text-muted-foreground sm:text-[11px]">No.{habitat.number}</p>}
                    {!habitat.number && habitat.isEvent && <p className="text-xs font-semibold text-muted-foreground sm:text-[11px]">이벤트 서식지</p>}
                    <PreserveSearchLink href={`/habitats/${habitat.id}`} className="text-base font-bold text-foreground hover:text-pk-green-dark">
                      {habitat.name}
                    </PreserveSearchLink>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mono rounded-full bg-pk-green-light px-3 py-1 text-xs font-bold text-pk-green-dark">{habitat.pokemonCount}</span>
                    <CollectionToggleButton category="habitats" itemId={habitat.id} compact />
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground sm:text-xs">주 지역: {habitat.mapNames.join(' · ') || '미상'}</p>
                <p className="mt-1 text-sm text-muted-foreground sm:text-xs">주 서식지 포켓몬 {habitat.primaryPokemonCount}마리</p>
                <PreserveSearchLink
                  href={`/habitats/${habitat.id}`}
                  className="mt-2 inline-flex rounded-full border border-border bg-white px-3 py-1 text-sm font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark sm:text-[11px]"
                >
                  자세히 보기
                </PreserveSearchLink>
              </div>
            </div>
            <div className="border-t border-border bg-[#fffdf8] px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground sm:text-[11px]">연결 포켓몬</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {habitat.pokemonEntries.slice(0, 8).map((entry) => (
                  <PreserveSearchLink
                    key={`${habitat.id}-${entry.slug}`}
                    href={`/pokemon/${entry.slug}`}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground hover:border-pk-green hover:text-pk-green-dark sm:text-[11px]"
                  >
                    #{entry.number} {entry.name}
                  </PreserveSearchLink>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {filteredHabitats.length === 0 && <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</div>}
    </div>
  );
}
