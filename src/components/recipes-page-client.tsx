'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import { useCollection } from '@/components/collection-provider';
import { isOwnershipFilter, matchesOwnershipFilter, type OwnershipFilter } from '@/lib/collection';
import MaterialTag from '@/components/material-tag';
import type { RecipeEntryWithSource } from '@/app/recipes/page';

// 일본어 카테고리 → 한국어 매핑
const CATEGORY_MAP: Record<string, string> = {
  べんり: '편의',
  ブロック: '블록',
  家具: '가구',
  ざっか: '잡화',
  たてもの: '건물',
  おくがい: '야외',
};

function getCategoryKo(category: string | null | undefined): string {
  if (!category) return '기타';
  return CATEGORY_MAP[category] ?? '기타';
}

const CATEGORY_FILTERS = ['전체', '가구', '잡화', '건물', '블록', '편의', '야외', '기타'] as const;

type SourceFilter = 'all' | 'shop' | 'other';

interface RecipesPageClientProps {
  recipes: RecipeEntryWithSource[];
}

export default function RecipesPageClient({ recipes }: RecipesPageClientProps) {
  const searchParams = useSearchParams();
  const queryQ = searchParams.get('q') ?? '';
  const queryOwned = searchParams.get('owned');

  const [search, setSearch] = useState(queryQ);
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>(
    isOwnershipFilter(queryOwned) ? queryOwned : 'all'
  );
  const [selected, setSelected] = useState<RecipeEntryWithSource | null>(null);

  const { recipeOwnedSet, toggleRecipe } = useCollection();

  const syncedParams = useMemo(
    () => ({
      q: search,
      owned: ownershipFilter === 'all' ? undefined : ownershipFilter,
    }),
    [search, ownershipFilter]
  );
  useSyncQueryParams(syncedParams);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
      // 보유 필터
      const owned = recipeOwnedSet.has(recipe.id);
      if (!matchesOwnershipFilter(owned, ownershipFilter)) return false;

      // 카테고리 필터
      if (categoryFilter !== '전체') {
        const ko = getCategoryKo(recipe.category);
        if (ko !== categoryFilter) return false;
      }

      // 출처 필터
      if (sourceFilter === 'shop' && recipe.sourceType !== 'shop') return false;
      if (sourceFilter === 'other' && recipe.sourceType !== 'other') return false;

      // 검색 필터
      if (query) {
        const nameKo = recipe.nameKo ?? '';
        return (
          nameKo.toLowerCase().includes(query) ||
          recipe.sourceKo.toLowerCase().includes(query) ||
          (recipe.materialsKo ?? []).some((m) => m.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [recipes, recipeOwnedSet, ownershipFilter, categoryFilter, sourceFilter, search]);

  const ownedCount = useMemo(
    () => recipes.filter((r) => recipeOwnedSet.has(r.id)).length,
    [recipes, recipeOwnedSet]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">레시피</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전체 {recipes.length}개 · 보유{' '}
          <span className="font-semibold text-pk-green-dark">{ownedCount}</span>개
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        {/* 검색창 */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 재료, 입수처로 검색"
          className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
        />

        {/* 카테고리 필터 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-pk-green text-white border-pk-green'
                  : 'border-border bg-background text-foreground hover:border-pk-green'
              }`}
            >
              {cat}
            </button>
          ))}

          <span className="mx-1 self-center text-border">|</span>

          {(
            [
              { key: 'all', label: '전체' },
              { key: 'shop', label: '상점' },
              { key: 'other', label: '기타' },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setSourceFilter(f.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                sourceFilter === f.key
                  ? 'bg-pk-green text-white border-pk-green'
                  : 'border-border bg-background text-foreground hover:border-pk-green'
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="mx-1 self-center text-border">|</span>

          {(
            [
              { key: 'all', label: '전체' },
              { key: 'owned', label: '보유' },
              { key: 'missing', label: '미보유' },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setOwnershipFilter(f.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                ownershipFilter === f.key
                  ? 'bg-pk-green text-white border-pk-green'
                  : 'border-border bg-background text-foreground hover:border-pk-green'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 결과 수 */}
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>
          {ownershipFilter !== 'all' || search.trim() || categoryFilter !== '전체' || sourceFilter !== 'all'
            ? ` / ${recipes.length}`
            : ''}
          개
        </p>

        {/* 그리드 */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((recipe) => {
            const isOwned = recipeOwnedSet.has(recipe.id);
            const nameKo = recipe.nameKo ?? '';

            return (
              <button
                key={recipe.id}
                type="button"
                onClick={() => setSelected(recipe)}
                className="overflow-hidden rounded-2xl border border-border bg-background text-left transition-colors hover:border-pk-green"
              >
                <div className="relative aspect-square w-full bg-muted rounded-t-2xl">
                  {recipe.imagePath ? (
                    <Image
                      src={recipe.imagePath}
                      alt={nameKo}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                      ?
                    </div>
                  )}
                  {isOwned && (
                    <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-pk-green text-white text-xs flex items-center justify-center leading-none">
                      ✓
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5 text-center">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{nameKo}</p>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            조건에 맞는 레시피가 없습니다.
          </div>
        )}
      </section>

      {/* 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground"
              aria-label="닫기"
            >
              ✕
            </button>

            {/* 이미지 */}
            {selected.imagePath && (
              <div className="relative mx-auto mb-4 h-24 w-24">
                <Image
                  src={selected.imagePath}
                  alt={selected.nameKo ?? ''}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}

            {/* 이름 + 뱃지 */}
            <h2 className="text-center text-lg font-bold text-foreground">
              {selected.nameKo ?? ''}
            </h2>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <span className="rounded-full bg-pk-green-light px-2.5 py-0.5 text-xs font-semibold text-pk-green-dark">
                {getCategoryKo(selected.category)}
              </span>
              <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {selected.sourceLabel}
              </span>
            </div>

            {/* 구분선 */}
            <div className="my-4 border-t border-border" />

            {/* 입수처 */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">입수처</p>
                <p className="mt-0.5 text-sm text-foreground">
                  {selected.sourceKo}
                  {selected.price != null && (
                    <span className="ml-1 text-pk-green-dark font-semibold">
                      ({selected.price.toLocaleString()} G)
                    </span>
                  )}
                </p>
              </div>

              {/* 제작 재료 */}
              {selected.materialsKo && selected.materialsKo.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">제작 재료</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selected.materialsKo.map((material, i) => (
                      <MaterialTag key={i} material={material} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 보유 토글 버튼 */}
            <button
              type="button"
              onClick={() => toggleRecipe(selected.id)}
              className={`mt-6 w-full rounded-2xl py-2.5 text-sm font-semibold transition-colors ${
                recipeOwnedSet.has(selected.id)
                  ? 'bg-pk-green text-white hover:opacity-90'
                  : 'border border-border bg-background text-foreground hover:border-pk-green'
              }`}
            >
              {recipeOwnedSet.has(selected.id) ? '✓ 보유 중' : '보유 체크'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
