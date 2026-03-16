'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import type { MaterialUsage } from '@/types/pokemon';

interface MaterialsPageClientProps {
  materials: MaterialUsage[];
}

type CategoryFilter = 'all' | 'cooking' | 'habitat' | 'building' | 'craft';

const categoryLabels: Record<CategoryFilter, string> = {
  all: '전체',
  cooking: '요리',
  habitat: '서식지',
  building: '건축',
  craft: '제작',
};

const categoryColors: Record<string, string> = {
  cooking: 'bg-pk-gold/15 text-pk-gold',
  habitat: 'bg-pk-green-light text-pk-green-dark',
  building: 'bg-pk-sky-light text-pk-sky',
  craft: 'bg-purple-100 text-purple-700',
};

export default function MaterialsPageClient({ materials }: MaterialsPageClientProps) {
  const searchParams = useSearchParams();
  const queryQ = searchParams.get('q') ?? '';
  const queryCat = (searchParams.get('cat') ?? 'all') as CategoryFilter;

  const [search, setSearch] = useState(queryQ);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(queryCat);

  const syncedParams = useMemo(
    () => ({
      q: search,
      cat: categoryFilter === 'all' ? undefined : categoryFilter,
    }),
    [search, categoryFilter]
  );

  useSyncQueryParams(syncedParams);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return materials
      .filter((item) => {
        if (!query) return true;
        return item.material.toLowerCase().includes(query);
      })
      .map((item) => {
        if (categoryFilter === 'all') return item;
        return {
          ...item,
          usages: item.usages.filter((u) => u.category === categoryFilter),
        };
      })
      .filter((item) => item.usages.length > 0);
  }, [materials, search, categoryFilter]);

  const totalUsages = filtered.reduce((sum, item) => sum + item.usages.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">재료 검색</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          재료 이름을 입력하면 해당 재료가 사용되는 요리, 서식지, 건축물을 보여줍니다.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="재료 이름 검색 (예: 밀, 구리 주괴, 포켓메탈)"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 pr-10 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                  active ? 'bg-pk-brown text-white' : 'border border-border bg-background text-foreground hover:border-pk-brown'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            );
          })}
        </div>

        {search.trim() && (
          <p className="mt-3 text-xs text-muted-foreground">
            재료 <span className="mono font-semibold text-foreground">{filtered.length}</span>종 ·
            사용처 <span className="mono font-semibold text-foreground">{totalUsages}</span>건
          </p>
        )}
      </section>

      {search.trim() ? (
        filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((item) => (
              <section key={item.material} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-foreground">{item.material}</h2>
                  <span className="mono text-xs text-muted-foreground">{item.usages.length}건</span>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {item.usages.map((usage, index) => {
                    const content = (
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:border-pk-green">
                        {usage.imagePath && (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted/40">
                            <Image src={usage.imagePath} alt="" aria-hidden width={32} height={32} className="max-h-8 w-auto object-contain" unoptimized={usage.imagePath.startsWith('http')} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${categoryColors[usage.category]}`}>
                              {usage.categoryLabel}
                            </span>
                            <span className="truncate text-sm font-bold text-foreground">{usage.name}</span>
                          </div>
                          {usage.detail && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">{usage.detail}</p>
                          )}
                        </div>
                      </div>
                    );

                    if (usage.href) {
                      return (
                        <Link prefetch={false} key={`${item.material}-${usage.category}-${index}`} href={usage.href}>
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div key={`${item.material}-${usage.category}-${index}`}>
                        {content}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
            해당 재료를 찾을 수 없습니다.
          </div>
        )
      ) : (
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-bold text-foreground">자주 찾는 재료</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {['콩', '잎사귀', '밀', '맛있는물', '감자', '해초', '토마토', '포켓메탈', '구리 주괴', '금 주괴', '돌', '얼음'].map((mat) => {
              const exists = materials.some((m) => m.material.toLowerCase() === mat.toLowerCase());
              if (!exists) return null;
              return (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setSearch(mat)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-pk-green hover:text-pk-green-dark"
                >
                  {mat}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            총 <span className="mono font-semibold text-foreground">{materials.length}</span>종의 재료가 등록되어 있습니다.
          </p>
        </section>
      )}
    </div>
  );
}
