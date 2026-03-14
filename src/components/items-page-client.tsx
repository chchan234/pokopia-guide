'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import ZoomableImage from '@/components/zoomable-image';
import type { AllItemEntry, AncientItemGroup, BuildingEntry, ItemsData } from '@/types/pokemon';

interface ItemsPageClientProps {
  data: ItemsData;
}

type ItemsTab = 'allitems' | 'buildings' | 'recipes' | 'dolls' | 'cds' | 'berries' | 'emotes' | 'collections' | 'ancients';

type RecipeSourceFilter = 'all' | 'shop' | 'other';

const tabLabels: Record<ItemsTab, string> = {
  allitems: '전체 아이템',
  buildings: '건축 키트',
  recipes: '레시피',
  dolls: '인형',
  cds: 'CD',
  berries: '열매',
  emotes: '감정표현',
  collections: '벽화·석판',
  ancients: '고대의 물건',
};

function displayName(nameKo: string | null | undefined, nameJp: string) {
  return nameKo || nameJp;
}

function isItemsTab(value: string | null): value is ItemsTab {
  return value !== null && ['allitems', 'buildings', 'recipes', 'dolls', 'cds', 'berries', 'emotes', 'collections', 'ancients'].includes(value);
}

function isRecipeSourceFilter(value: string): value is RecipeSourceFilter {
  return ['all', 'shop', 'other'].includes(value);
}

function matchesQuery(query: string, values: Array<string | null | undefined>) {
  if (!query) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(query));
}

function VisualCard({
  title,
  subtitle,
  body,
  imagePath,
}: {
  title: string;
  subtitle?: string;
  body: ReactNode;
  imagePath: string | null;
}) {
  return (
    <article className="rounded-3xl border border-border bg-background p-5" style={{ contentVisibility: 'auto' }}>
      {imagePath && (
        <div className="mb-4 flex justify-center">
          <ZoomableImage
            src={imagePath}
            alt={title}
            width={120}
            height={120}
            className="h-24 w-24 rounded-2xl border border-border bg-card object-contain p-2"
            buttonClassName="cursor-zoom-in"
          />
        </div>
      )}
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-3 text-sm text-muted-foreground">{body}</div>
    </article>
  );
}

function CardPreview({ src, alt, size = 'default' }: { src: string | null; alt: string; size?: 'default' | 'small' }) {
  if (!src) {
    return null;
  }

  const dimension = size === 'small' ? 52 : 120;
  const className =
    size === 'small'
      ? 'h-11 w-11 rounded-xl border border-border bg-card object-contain p-1.5'
      : 'h-24 w-24 rounded-2xl border border-border bg-card object-contain p-2';

  return (
    <div className={size === 'small' ? 'shrink-0' : 'mb-4 flex justify-center'}>
      <ZoomableImage
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className={className}
        buttonClassName="cursor-zoom-in"
      />
    </div>
  );
}

export default function ItemsPageClient({ data }: ItemsPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const queryTab = searchParams.get('tab');
  const queryRecipeSource = searchParams.get('recipeSource') ?? 'all';
  const [activeTab, setActiveTab] = useState<ItemsTab>(isItemsTab(queryTab) ? queryTab : 'allitems');
  const [search, setSearch] = useState(querySearch);
  const [recipeSourceFilter, setRecipeSourceFilter] = useState<RecipeSourceFilter>(isRecipeSourceFilter(queryRecipeSource) ? queryRecipeSource : 'all');

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
    if (!isItemsTab(queryTab)) {
      setActiveTab('allitems');
      return;
    }

    setActiveTab(queryTab);
  }, [queryTab]);

  useEffect(() => {
    if (isRecipeSourceFilter(queryRecipeSource)) {
      setRecipeSourceFilter(queryRecipeSource);
      return;
    }

    setRecipeSourceFilter('all');
  }, [queryRecipeSource]);

  const syncedParams = useMemo(
    () => ({
      q: search,
      tab: activeTab === 'allitems' ? undefined : activeTab,
      recipeSource: activeTab === 'recipes' && recipeSourceFilter !== 'all' ? recipeSourceFilter : undefined,
    }),
    [activeTab, recipeSourceFilter, search]
  );

  useSyncQueryParams(syncedParams);

  const recipeEntries = useMemo(
    () => [...data.recipes.shop.map((entry) => ({ ...entry, label: '상점' })), ...data.recipes.other.map((entry) => ({ ...entry, label: '기타' }))],
    [data.recipes.other, data.recipes.shop]
  );

  const filteredAllItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.allItems.filter((entry: AllItemEntry) =>
      matchesQuery(query, [entry.nameKo, entry.nameJp, entry.categoryKo, entry.categoryJp, entry.useKo, entry.useJp, ...entry.usageTargetsKo, ...entry.usageTargetsJp])
    );
  }, [data.allItems, search]);

  const filteredBuildings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.buildings.filter((entry: BuildingEntry) =>
      matchesQuery(query, [
        entry.nameKo, entry.nameJp, entry.typeKo, entry.useKo, entry.useJp,
        ...entry.requiredMaterialsKo, ...entry.requiredSpecialtiesKo,
      ])
    );
  }, [data.buildings, search]);

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recipeEntries.filter((entry) => {
      if (recipeSourceFilter !== 'all' && entry.sourceType !== recipeSourceFilter) {
        return false;
      }

      return matchesQuery(query, [entry.nameJp, entry.sourceJp, entry.sourceKo, entry.label]);
    });
  }, [recipeEntries, recipeSourceFilter, search]);

  const filteredDolls = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.dolls.filter((entry) =>
      matchesQuery(query, [entry.nameKo, entry.nameJp, entry.mapKo, entry.mapJp, entry.dreamIslandKo, entry.dreamIslandJp, entry.noteKo, entry.noteJp])
    );
  }, [data.dolls, search]);

  const filteredCds = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.cds.filter((entry) => matchesQuery(query, [entry.nameKo, entry.nameJp, entry.obtainKo, entry.obtainJp, entry.useKo]));
  }, [data.cds, search]);

  const filteredBerries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.berries.filter((entry) => matchesQuery(query, [entry.nameKo, entry.nameJp, entry.obtainKo, entry.obtainJp, ...entry.notesKo]));
  }, [data.berries, search]);

  const filteredEmotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.emotes.filter((entry) => matchesQuery(query, [entry.nameKo, entry.nameJp, entry.obtainKo, entry.obtainJp]));
  }, [data.emotes, search]);

  const filteredCollections = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.specialCollections.filter((entry) => matchesQuery(query, [entry.nameKo, entry.nameJp, entry.summaryKo]));
  }, [data.specialCollections, search]);

  const filteredAncients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.ancientItemGroups
      .map((group) => {
        if (!query) {
          return group;
        }

        return {
          ...group,
          items: group.items.filter((item) =>
            matchesQuery(query, [item.nameKo, item.nameJp, item.mapKo, item.mapJp, item.number ? String(item.number) : null])
          ),
        } satisfies AncientItemGroup;
      })
      .filter((group) => group.items.length > 0);
  }, [data.ancientItemGroups, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">아이템</h1>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`${tabLabels[activeTab]} 이름, 입수처, 설명으로 검색`}
          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
        />

        <div className="mt-3">
          <select
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value as ItemsTab)}
            className="h-9 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
          >
            {(Object.keys(tabLabels) as ItemsTab[]).map((tab) => (
              <option key={tab} value={tab}>
                {tabLabels[tab]}
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'allitems' && (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {filteredAllItems.map((entry) => (
              <article key={entry.id} className="rounded-3xl border border-border bg-background p-5" style={{ contentVisibility: 'auto' }}>
                <CardPreview src={entry.imagePath} alt={displayName(entry.nameKo, entry.nameJp)} />
                <div className="flex flex-wrap items-center gap-2">
                  {entry.categoryKo && (
                    <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">{entry.categoryKo}</span>
                  )}
                  {entry.usageTargetsKo.length > 0 && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      연결 {entry.usageTargetsKo.length}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">{displayName(entry.nameKo, entry.nameJp)}</h3>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>사용처: {entry.useKo}</p>
                  {entry.usageTargetsKo.length > 0 && <p>연결 대상: {entry.usageTargetsKo.join(', ')}</p>}
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {filteredBuildings.map((entry) => (
              <article key={entry.id} className="rounded-3xl border border-border bg-background p-5" style={{ contentVisibility: 'auto' }}>
                <CardPreview src={entry.imagePath} alt={displayName(entry.nameKo, entry.nameJp)} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">{entry.typeKo}</span>
                  {entry.capacity && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{entry.capacity}</span>
                  )}
                  {entry.buildTime && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{entry.buildTime}</span>
                  )}
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">{displayName(entry.nameKo, entry.nameJp)}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  {entry.requiredMaterialsKo.length > 0 && (
                    <div>
                      <dt className="font-semibold text-foreground">필요 재료</dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {entry.requiredMaterialsKo.map((mat, i) => (
                          <span key={`${entry.id}-mat-${i}`} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">{mat}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {entry.requiredSpecialtiesKo.length > 0 && (
                    <div>
                      <dt className="font-semibold text-foreground">필요 특기</dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {entry.requiredSpecialtiesKo.map((spec) => (
                          <span key={`${entry.id}-spec-${spec}`} className="rounded-full bg-pk-brown-light px-2.5 py-1 text-xs font-semibold text-pk-brown-dark">{spec}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {entry.useKo && (
                    <div>
                      <dt className="font-semibold text-foreground">용도</dt>
                      <dd className="mt-1 text-muted-foreground">{entry.useKo}</dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: '전체' },
                { key: 'shop', label: '상점' },
                { key: 'other', label: '기타' },
              ].map((filter) => {
                const active = recipeSourceFilter === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setRecipeSourceFilter(filter.key as RecipeSourceFilter)}
                    className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                      active ? 'bg-pk-brown text-white' : 'border border-border bg-background text-foreground hover:border-pk-brown'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {filteredRecipes.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-3xl border border-border bg-background p-5"
                  style={{ contentVisibility: 'auto' }}
                >
                  <CardPreview src={entry.imagePath} alt={displayName(entry.nameKo, entry.nameJp)} />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">{entry.label}</span>
                    {typeof entry.price === 'number' && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{entry.price} 포코</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-bold text-foreground">{displayName(entry.nameKo, entry.nameJp)}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">입수: {entry.sourceKo}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dolls' && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredDolls.map((entry) => (
              <article key={entry.id} className="rounded-3xl border border-border bg-background p-5" style={{ contentVisibility: 'auto' }}>
                <CardPreview src={entry.imagePath} alt={displayName(entry.nameKo, entry.nameJp)} />
                <h3 className="text-base font-bold text-foreground">{displayName(entry.nameKo, entry.nameJp)}</h3>
                <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div>
                    <dt className="font-semibold text-foreground">연결 꿈섬</dt>
                    <dd className="mt-1">{entry.dreamIslandKo}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">입수 지역</dt>
                    <dd className="mt-1">{entry.mapKo}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">메모</dt>
                    <dd className="mt-1">{entry.noteKo || '-'}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'cds' && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredCds.map((entry) => (
              <article key={entry.id} className="rounded-3xl border border-border bg-background p-5" style={{ contentVisibility: 'auto' }}>
                <CardPreview src={entry.imagePath} alt={displayName(entry.nameKo, entry.nameJp)} />
                <h3 className="text-base font-bold text-foreground">{displayName(entry.nameKo, entry.nameJp)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">입수: {entry.obtainKo}</p>
                <p className="mt-2 text-sm text-muted-foreground">사용: {entry.useKo}</p>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'berries' && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredBerries.map((entry) => (
              <VisualCard
                key={entry.id}
                title={displayName(entry.nameKo, entry.nameJp)}
                subtitle={`입수: ${entry.obtainKo}`}
                imagePath={entry.imagePath}
                body={
                  <div className="space-y-2">
                    {entry.notesKo.map((note) => (
                      <p key={note}>{note}</p>
                    ))}
                  </div>
                }
              />
            ))}
          </div>
        )}

        {activeTab === 'emotes' && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredEmotes.map((entry) => (
              <VisualCard
                key={entry.id}
                title={displayName(entry.nameKo, entry.nameJp)}
                subtitle={`입수: ${entry.obtainKo}`}
                imagePath={entry.imagePath}
                body={<p>{entry.obtainKo}</p>}
              />
            ))}
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filteredCollections.map((entry) => (
              <VisualCard key={entry.id} title={entry.nameKo} imagePath={entry.imagePath} body={<p>{entry.summaryKo}</p>} />
            ))}
          </div>
        )}

        {activeTab === 'ancients' && (
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            {filteredAncients.map((group) => (
              <article key={group.id} className="rounded-3xl border border-border bg-background p-5" style={{ contentVisibility: 'auto' }}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-foreground">{group.nameKo}</h3>
                  <span className="mono text-sm text-muted-foreground">{group.items.length}</span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {group.items.map((item, index) => (
                    <div key={`${group.id}-${item.nameJp}-${index}`} className="rounded-2xl border border-border bg-card px-3 py-2">
                      <div className="flex items-center gap-3">
                        <CardPreview src={item.imagePath} alt={displayName(item.nameKo, item.nameJp)} size="small" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-foreground">{displayName(item.nameKo, item.nameJp)}</span>
                            {typeof item.number === 'number' && <span className="mono text-[11px] text-muted-foreground">#{item.number}</span>}
                          </div>
                          {item.mapKo && <p className="mt-1 text-xs text-muted-foreground">출현 지역: {item.mapKo}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'allitems' && filteredAllItems.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 아이템이 없습니다.</div>}
        {activeTab === 'buildings' && filteredBuildings.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 건축 키트가 없습니다.</div>}
        {activeTab === 'recipes' && filteredRecipes.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 레시피가 없습니다.</div>}
        {activeTab === 'dolls' && filteredDolls.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 인형이 없습니다.</div>}
        {activeTab === 'cds' && filteredCds.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 CD가 없습니다.</div>}
        {activeTab === 'berries' && filteredBerries.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 열매가 없습니다.</div>}
        {activeTab === 'emotes' && filteredEmotes.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 감정표현이 없습니다.</div>}
        {activeTab === 'collections' && filteredCollections.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 컬렉션이 없습니다.</div>}
        {activeTab === 'ancients' && filteredAncients.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 고대의 물건이 없습니다.</div>}
      </section>
    </div>
  );
}
