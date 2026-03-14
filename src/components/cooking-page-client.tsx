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

const tasteColors: Record<string, string> = {
  '매콤함': 'bg-red-100 text-red-700',
  '달콤함': 'bg-pink-100 text-pink-700',
  '쌉쌀함': 'bg-emerald-100 text-emerald-700',
  '새콤함': 'bg-yellow-100 text-yellow-700',
  '떫은맛': 'bg-purple-100 text-purple-700',
  '보통': 'bg-gray-100 text-gray-600',
};

export default function CookingPageClient({ data }: CookingPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const queryTool = searchParams.get('tool') ?? 'all';
  const [search, setSearch] = useState(querySearch);
  const [toolFilter, setToolFilter] = useState(queryTool);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSearch(querySearch);
    setToolFilter(queryTool);
  }, [querySearch, queryTool]);
  /* eslint-enable react-hooks/set-state-in-effect */

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

  // 도우미 특기가 필요한 요리 목록
  const helperDishes = useMemo(
    () => data.dishes.filter((dish) => dish.helperSpecialtyJp),
    [data.dishes]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">요리</h1>
        <p className="mt-1 text-sm text-muted-foreground">총 {data.summary.dishCount}개 요리 · 도구 {data.summary.toolCount}종</p>
      </div>

      {/* 공물 시스템 */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">공물 시스템</h2>
        <p className="mt-2 text-sm text-muted-foreground">{data.offeringSystem.descriptionKo}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">{data.offeringSystem.unlockKo}</span>
          <span className="rounded-full bg-muted px-3 py-1">{data.offeringSystem.durationKo}</span>
        </div>

        {/* 효과 등급 */}
        <div className="mt-5 flex flex-wrap gap-3">
          {data.offeringSystem.grades.map((grade) => (
            <div key={grade.labelJp} className="flex-1 rounded-2xl border border-border bg-background p-4 text-center" style={{ minWidth: '140px' }}>
              <div className="text-lg font-extrabold text-pk-green-dark">{grade.labelKo}</div>
              <p className="mt-1 text-xs text-muted-foreground">{grade.descriptionKo}</p>
            </div>
          ))}
        </div>

        {/* 맛별 공물 효과 테이블 */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-3 py-2.5 font-semibold text-foreground">맛</th>
                <th className="px-3 py-2.5 font-semibold text-foreground">공물 효과</th>
                <th className="hidden px-3 py-2.5 font-semibold text-foreground sm:table-cell">추천 요리</th>
              </tr>
            </thead>
            <tbody>
              {data.offeringSystem.tasteEffects.map((taste) => (
                <tr key={taste.tasteJp} className="border-b border-border last:border-0">
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tasteColors[taste.tasteKo] ?? 'bg-muted text-muted-foreground'}`}>
                      {taste.tasteKo}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{taste.effectKo}</td>
                  <td className="hidden px-3 py-3 font-medium text-foreground sm:table-cell">{taste.topDishKo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 도구별 구조 + 종류별 강화 */}
      <section className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">도구별 기본 구조</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 py-2.5 font-semibold text-foreground">도구</th>
                  <th className="px-3 py-2.5 font-semibold text-foreground">기본 재료</th>
                  <th className="px-3 py-2.5 font-semibold text-foreground">요리 종류</th>
                </tr>
              </thead>
              <tbody>
                {data.toolCards.map((tool) => (
                  <tr key={tool.toolJp} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 font-medium text-foreground">{displayName(tool.toolKo, tool.toolJp)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{displayName(tool.mainIngredientKo, tool.mainIngredientJp)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{displayName(tool.dishTypeKo, tool.dishTypeJp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">종류별 강화 특기</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 py-2.5 font-semibold text-foreground">종류</th>
                  <th className="px-3 py-2.5 font-semibold text-foreground">강화 특기</th>
                  <th className="px-3 py-2.5 font-semibold text-foreground">효과</th>
                </tr>
              </thead>
              <tbody>
                {data.categoryEffects.map((entry) => (
                  <tr key={entry.categoryJp} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-xs font-semibold text-pk-green-dark">
                        {displayName(entry.categoryKo, entry.categoryJp)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{displayName(entry.skillKo, entry.skillJp)}</td>
                    <td className="px-3 py-3 text-muted-foreground">{entry.effectKo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 도우미 요리 시스템 */}
      {helperDishes.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">도우미 요리</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            근처에 특정 특기를 가진 포켓몬이 있으면 요리를 도와 특별한 레시피가 완성된다.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-3 py-2.5 font-semibold text-foreground">필요 특기</th>
                  <th className="px-3 py-2.5 font-semibold text-foreground">완성 요리</th>
                  <th className="px-3 py-2.5 font-semibold text-foreground">도구</th>
                  <th className="hidden px-3 py-2.5 font-semibold text-foreground sm:table-cell">재료</th>
                </tr>
              </thead>
              <tbody>
                {helperDishes.map((dish) => (
                  <tr key={dish.id} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
                        {displayName(dish.helperSpecialtyKo, dish.helperSpecialtyJp!)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">{displayName(dish.nameKo, dish.nameJp)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">{displayName(dish.toolKo, dish.toolJp)}</td>
                    <td className="hidden px-3 py-3 text-muted-foreground sm:table-cell">{dish.materialsKo.join(' + ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 요리 목록 */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">전체 요리 목록</h2>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="요리명, 재료, 특기, 효과로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            <span className="mono font-semibold text-foreground">{filteredDishes.length}</span>
            {search.trim() || toolFilter !== 'all' ? ` / ${data.dishes.length}` : ''}개
          </p>
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
              className="overflow-hidden rounded-3xl border border-border bg-background"
              style={{ contentVisibility: 'auto' }}
            >
              <div className="flex gap-4 p-5">
                {dish.imagePath && (
                  <div className="flex-shrink-0">
                    <ZoomableImage
                      src={dish.imagePath}
                      alt={displayName(dish.nameKo, dish.nameJp)}
                      width={80}
                      height={80}
                      className="h-[72px] w-[72px] rounded-2xl border border-border bg-card object-contain p-1.5"
                      buttonClassName="cursor-zoom-in"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-pk-green-light px-2 py-0.5 text-[11px] font-semibold text-pk-green-dark">
                      {displayName(dish.categoryKo, dish.categoryJp)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${(dish.tasteKo && tasteColors[dish.tasteKo]) ?? 'bg-muted text-muted-foreground'}`}>
                      {displayName(dish.tasteKo, dish.tasteJp)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-foreground">{displayName(dish.nameKo, dish.nameJp)}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {dish.materialsKo.map((item, index) => (
                      <span key={`${dish.id}-material-${index}`} className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-border bg-secondary/50 px-5 py-3">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span className="text-muted-foreground">도구: <span className="font-medium text-foreground">{displayName(dish.toolKo, dish.toolJp)}</span></span>
                  <span className="text-muted-foreground">강화: <span className="font-medium text-foreground">{displayName(dish.boostedSkillKo, dish.boostedSkillJp)}</span></span>
                  {dish.helperSpecialtyJp && (
                    <span className="text-muted-foreground">도움 특기: <span className="font-medium text-foreground">{displayName(dish.helperSpecialtyKo, dish.helperSpecialtyJp)}</span></span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{dish.offeringEffectKo}</p>
              </div>
            </article>
          ))}
        </div>

        {filteredDishes.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 요리가 없습니다.</div>}
      </section>

      {/* 참고 사항 */}
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">참고</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {data.summary.notesKo.map((note) => (
            <li key={note} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pk-brown" />
              {note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
