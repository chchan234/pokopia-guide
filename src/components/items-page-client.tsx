'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import ZoomableImage from '@/components/zoomable-image';
import MaterialTag from '@/components/material-tag';
import { displayName, matchesQuery } from '@/lib/utils';
import type { AllItemEntry, AncientItemGroup, BuildingEntry, ItemsData } from '@/types/pokemon';

interface ItemsPageClientProps {
  data: ItemsData;
}

type ItemsTab = 'allitems' | 'craftable' | 'buildings' | 'dolls' | 'cds' | 'berries' | 'emotes' | 'collections' | 'ancients';

const tabLabels: Record<ItemsTab, string> = {
  allitems: '전체 아이템',
  craftable: '제작 아이템',
  buildings: '건축 키트',
  dolls: '인형',
  cds: 'CD',
  berries: '열매',
  emotes: '감정표현',
  collections: '벽화·석판',
  ancients: '고대의 물건',
};

function isItemsTab(value: string | null): value is ItemsTab {
  return value !== null && ['allitems', 'craftable', 'buildings', 'dolls', 'cds', 'berries', 'emotes', 'collections', 'ancients'].includes(value);
}

// 카테고리 필터 칩 목록 (전체 아이템 탭용)
const CATEGORY_FILTERS = ['전체', '가구', '잡화', '건물', '블록', '편의', '야외', '자연', '키트', '음식', '재료', '기타', '소중한 것'] as const;
type CategoryFilter = (typeof CATEGORY_FILTERS)[number];

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

// 아이템 상세 모달 컴포넌트
function ItemDetailModal({ entry, onClose }: { entry: AllItemEntry; onClose: () => void }) {
  const name = displayName(entry.nameKo, entry.nameJp);

  // Escape 키로 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* 모달 카드 */}
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
          aria-label="닫기"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* 이미지 */}
        {entry.imagePath && (
          <div className="mb-4 flex justify-center">
            <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-border bg-muted p-2">
              <Image
                src={entry.imagePath}
                alt={name}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* 카테고리 배지 + 이름 */}
        <div className="flex flex-wrap items-center gap-2">
          {entry.categoryKo && (
            <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">
              {entry.categoryKo}
            </span>
          )}
          {entry.craftMaterialsJp.length > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              제작 가능
            </span>
          )}
        </div>
        <h2 className="mt-2 text-lg font-bold text-foreground">{name}</h2>

        {/* 설명 (한국어만) */}
        {entry.descriptionKo && (
          <p className="mt-3 text-sm text-muted-foreground">{entry.descriptionKo}</p>
        )}

        {/* 제작 재료 */}
        {entry.craftMaterialsJp.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-foreground">제작 재료</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {entry.craftMaterialsJp.map((mat, i) => (
                <MaterialTag key={`modal-craft-${i}`} material={`${mat.nameKo || ''} ×${mat.count}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 컴팩트 아이템 그리드 카드 (썸네일)
function CompactItemCard({ entry, onClick }: { entry: AllItemEntry; onClick: () => void }) {
  const name = displayName(entry.nameKo, entry.nameJp);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-pk-green hover:bg-pk-green-light/20"
    >
      {/* 썸네일 영역 */}
      <div className="relative aspect-square w-full bg-muted">
        {entry.imagePath ? (
          <Image
            src={entry.imagePath}
            alt={name}
            fill
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xl text-muted-foreground">?</span>
          </div>
        )}
      </div>
      {/* 이름 + 카테고리 */}
      <div className="flex flex-col gap-0.5 p-2">
        <span className="line-clamp-1 text-xs font-medium text-foreground">{name}</span>
        {entry.categoryKo && (
          <span className="line-clamp-1 text-[10px] text-muted-foreground">{entry.categoryKo}</span>
        )}
      </div>
    </button>
  );
}

export default function ItemsPageClient({ data }: ItemsPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<ItemsTab>(isItemsTab(queryTab) ? queryTab : 'allitems');
  const [search, setSearch] = useState(querySearch);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('전체');
  const [selectedItem, setSelectedItem] = useState<AllItemEntry | null>(null);
  const filterRowRef = useRef<HTMLDivElement>(null);

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

  const syncedParams = useMemo(
    () => ({
      q: search,
      tab: activeTab === 'allitems' ? undefined : activeTab,
    }),
    [activeTab, search]
  );

  useSyncQueryParams(syncedParams);

  const filteredAllItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.allItems.filter((entry: AllItemEntry) => {
      // 카테고리 필터
      if (categoryFilter !== '전체' && entry.categoryKo !== categoryFilter) {
        return false;
      }

      // 검색어 필터
      return matchesQuery(query, [
        entry.nameKo,
        entry.nameJp,
        entry.categoryKo,
        entry.categoryJp,
        entry.descriptionKo,
        entry.descriptionJp,
        ...entry.craftMaterialsJp.map((m) => m.nameKo),
        ...entry.craftMaterialsJp.map((m) => m.nameJp),
      ]);
    });
  }, [data.allItems, search, categoryFilter]);

  const filteredCraftable = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.allItems
      .filter((entry: AllItemEntry) => entry.craftMaterialsJp.length > 0)
      .filter((entry: AllItemEntry) =>
        matchesQuery(query, [entry.nameKo, entry.nameJp, entry.categoryKo, entry.categoryJp, ...entry.craftMaterialsJp.map((m) => m.nameKo)])
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

  const handleCloseModal = useCallback(() => setSelectedItem(null), []);

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
            onChange={(event) => {
              setActiveTab(event.target.value as ItemsTab);
              setCategoryFilter('전체');
            }}
            className="h-9 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
          >
            {(Object.keys(tabLabels) as ItemsTab[]).map((tab) => (
              <option key={tab} value={tab}>
                {tabLabels[tab]}
              </option>
            ))}
          </select>
        </div>

        {/* 전체 아이템 탭 - 카테고리 필터 칩 */}
        {activeTab === 'allitems' && (
          <div
            ref={filterRowRef}
            className="mt-3 flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {CATEGORY_FILTERS.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-pk-green text-white'
                      : 'border border-border text-foreground hover:border-pk-green'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* 전체 아이템 탭 - 컴팩트 4열 그리드 */}
        {activeTab === 'allitems' && (
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredAllItems.map((entry) => (
              <CompactItemCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelectedItem(entry)}
              />
            ))}
          </div>
        )}

        {/* 제작 아이템 탭 - 컴팩트 4열 그리드 */}
        {activeTab === 'craftable' && (
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredCraftable.map((entry) => (
              <CompactItemCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelectedItem(entry)}
              />
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
                          <MaterialTag key={`${entry.id}-mat-${i}`} material={mat} />
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
                  {entry.legendaryPokemonKo && (
                    <div>
                      <dt className="font-semibold text-foreground">전설 포켓몬</dt>
                      <dd className="mt-1">{entry.legendaryPokemonKo}</dd>
                    </div>
                  )}
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
                body={null}
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

        {/* 빈 상태 메시지 */}
        {activeTab === 'allitems' && filteredAllItems.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 아이템이 없습니다.</div>}
        {activeTab === 'craftable' && filteredCraftable.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 제작 아이템이 없습니다.</div>}
        {activeTab === 'buildings' && filteredBuildings.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 건축 키트가 없습니다.</div>}
        {activeTab === 'dolls' && filteredDolls.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 인형이 없습니다.</div>}
        {activeTab === 'cds' && filteredCds.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 CD가 없습니다.</div>}
        {activeTab === 'berries' && filteredBerries.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 열매가 없습니다.</div>}
        {activeTab === 'emotes' && filteredEmotes.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 감정표현이 없습니다.</div>}
        {activeTab === 'collections' && filteredCollections.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 컬렉션이 없습니다.</div>}
        {activeTab === 'ancients' && filteredAncients.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 고대의 물건이 없습니다.</div>}
      </section>

      {/* 아이템 상세 모달 */}
      {selectedItem && (
        <ItemDetailModal entry={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
}
