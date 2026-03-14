'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import ZoomableImage from '@/components/zoomable-image';
import type { CookingData } from '@/types/pokemon';

interface CookingPageClientProps {
  data: CookingData;
}

function displayName(nameKo: string | null | undefined, nameJp: string) {
  return nameKo || nameJp;
}

function matchesQuery(query: string, values: Array<string | null | undefined>) {
  if (!query) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(query));
}

function DishPreview({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return null;
  }

  return (
    <div className="mb-4 flex justify-center">
      <ZoomableImage
        src={src}
        alt={alt}
        width={120}
        height={120}
        className="h-24 w-24 rounded-2xl border border-border bg-card object-contain p-2"
        buttonClassName="cursor-zoom-in"
      />
    </div>
  );
}

export default function CookingPageClient({ data }: CookingPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const queryTool = searchParams.get('tool') ?? 'all';
  const [search, setSearch] = useState(querySearch);
  const [toolFilter, setToolFilter] = useState(queryTool);

  useEffect(() => {
    setSearch(querySearch);
    setToolFilter(queryTool);
  }, [querySearch, queryTool]);

  const syncedParams = useMemo(
    () => ({
      q: search,
      tool: toolFilter === 'all' ? undefined : toolFilter,
    }),
    [search, toolFilter]
  );

  useSyncQueryParams(syncedParams);

  const tools = useMemo(() => ['all', ...new Set(data.dishes.map((dish) => dish.toolKo ?? dish.toolJp))], [data.dishes]);

  const filteredDishes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.dishes.filter((dish) => {
      const toolLabel = dish.toolKo ?? dish.toolJp;

      return (
        (toolFilter === 'all' || toolLabel === toolFilter) &&
        matchesQuery(query, [
          dish.nameKo,
          dish.nameJp,
          dish.categoryKo,
          dish.categoryJp,
          dish.tasteKo,
          dish.tasteJp,
          dish.toolKo,
          dish.toolJp,
          dish.boostedSkillKo,
          dish.boostedSkillJp,
          dish.helperSpecialtyKo,
          dish.helperSpecialtyJp,
          dish.offeringEffectKo,
          ...dish.materialsKo,
          ...dish.materialsJp,
        ])
      );
    });
  }, [data.dishes, search, toolFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">요리</h1>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: '요리', value: data.summary.dishCount },
          { label: '도구', value: data.summary.toolCount },
          { label: '종류', value: data.summary.categoryCount },
          { label: '현재 표시', value: filteredDishes.length },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="text-xs font-semibold text-muted-foreground">{item.label}</div>
            <div className="mono mt-2 text-3xl font-bold text-pk-green-dark">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">도구별 기본 구조</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.toolCards.map((tool) => (
              <article key={tool.toolJp} className="rounded-2xl border border-border bg-background p-4">
                <div className="text-sm font-bold text-foreground">{displayName(tool.toolKo, tool.toolJp)}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  기본 재료: {displayName(tool.mainIngredientKo, tool.mainIngredientJp)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">만드는 종류: {displayName(tool.dishTypeKo, tool.dishTypeJp)}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">종류별 대표 강화</h2>
          <div className="mt-4 space-y-3">
            {data.categoryEffects.map((entry) => (
              <article key={entry.categoryJp} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">
                    {displayName(entry.categoryKo, entry.categoryJp)}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {displayName(entry.skillKo, entry.skillJp)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{entry.effectKo}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="요리명, 재료, 특기, 효과로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {tools.map((tool) => {
            const active = toolFilter === tool;
            return (
              <button
                key={tool}
                type="button"
                onClick={() => setToolFilter(tool)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? 'bg-pk-brown text-white' : 'border border-border bg-background text-foreground hover:border-pk-brown'
                }`}
              >
                {tool === 'all' ? '전체 도구' : tool}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {filteredDishes.map((dish) => (
            <article
              key={dish.id}
              className="rounded-3xl border border-border bg-background p-5"
              style={{ contentVisibility: 'auto' }}
            >
              <DishPreview src={dish.imagePath} alt={displayName(dish.nameKo, dish.nameJp)} />
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">
                  {displayName(dish.categoryKo, dish.categoryJp)}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {displayName(dish.tasteKo, dish.tasteJp)}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-foreground">{displayName(dish.nameKo, dish.nameJp)}</h3>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-foreground">재료</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {dish.materialsKo.map((item, index) => (
                      <span key={`${dish.id}-material-${index}`} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
                        {item}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">조리 도구</dt>
                  <dd className="mt-1 text-muted-foreground">{displayName(dish.toolKo, dish.toolJp)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">강화 특기</dt>
                  <dd className="mt-1 text-muted-foreground">{displayName(dish.boostedSkillKo, dish.boostedSkillJp)}</dd>
                </div>
                {dish.helperSpecialtyJp && (
                  <div>
                    <dt className="font-semibold text-foreground">도움 포켓몬 특기</dt>
                    <dd className="mt-1 text-muted-foreground">{displayName(dish.helperSpecialtyKo, dish.helperSpecialtyJp)}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold text-foreground">공물 효과</dt>
                  <dd className="mt-1 rounded-2xl bg-card px-3 py-2 text-muted-foreground">{dish.offeringEffectKo}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {filteredDishes.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 요리가 없습니다.</div>}
      </section>
    </div>
  );
}
