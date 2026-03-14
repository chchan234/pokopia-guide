'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import PreserveSearchLink from '@/components/preserve-search-link';
import type { GlobalSearchEntry } from '@/types/pokemon';

interface HomeSearchClientProps {
  entries: GlobalSearchEntry[];
}

const categoryOrder = ['pokemon', 'habitats', 'records', 'fashion', 'dream', 'cooking', 'items', 'specialties'];
const detailCategories = new Set(['pokemon', 'habitats', 'records']);

function scoreEntry(entry: GlobalSearchEntry, query: string) {
  const title = entry.title.toLowerCase();
  const subtitle = entry.subtitle.toLowerCase();

  if (title === query) return 0;
  if (title.startsWith(query)) return 1;
  if (subtitle.startsWith(query)) return 2;
  if (title.includes(query)) return 3;
  return 4;
}

export default function HomeSearchClient({ entries }: HomeSearchClientProps) {
  const [query, setQuery] = useState('');

  const groupedResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    const matched = entries
      .filter((entry) => entry.searchText.includes(normalized))
      .sort((a, b) => {
        const scoreDiff = scoreEntry(a, normalized) - scoreEntry(b, normalized);
        if (scoreDiff !== 0) return scoreDiff;
        const categoryDiff = categoryOrder.indexOf(a.categoryKey) - categoryOrder.indexOf(b.categoryKey);
        if (categoryDiff !== 0) return categoryDiff;
        return a.title.localeCompare(b.title, 'ko');
      });

    const grouped = new Map<string, { label: string; items: GlobalSearchEntry[] }>();

    for (const entry of matched) {
      const current = grouped.get(entry.categoryKey) ?? { label: entry.categoryLabel, items: [] };
      if (current.items.length < 6) {
        current.items.push(entry);
      }
      grouped.set(entry.categoryKey, current);
    }

    return Array.from(grouped.entries())
      .sort((a, b) => categoryOrder.indexOf(a[0]) - categoryOrder.indexOf(b[0]))
      .map(([key, value]) => ({ key, ...value }));
  }, [entries, query]);

  const totalVisibleResults = groupedResults.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <section className="space-y-4 overflow-hidden rounded-[32px] border border-border bg-card p-5 md:p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-foreground">통합 검색</h1>
        <p className="text-sm text-muted-foreground">포켓몬, 서식지, 기록, 의상, 꿈섬, 요리, 아이템을 한 번에 찾습니다.</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="포켓몬, 서식지, 기록, 의상, 아이템 검색"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 pr-10 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {query.trim() ? (
        groupedResults.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              <span className="mono font-semibold text-foreground">{totalVisibleResults}</span>개 표시
            </p>
            {groupedResults.map((group) => (
              <section key={group.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-foreground">{group.label}</h2>
                  <span className="mono text-xs text-muted-foreground">{group.items.length}</span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {group.items.map((entry) => {
                    const CardLink = detailCategories.has(entry.categoryKey) ? PreserveSearchLink : Link;

                    return (
                      <CardLink
                        key={entry.id}
                        href={entry.href}
                        className="flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-background px-3 py-3 hover:border-pk-green"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted/40">
                          {entry.imagePath ? (
                            <Image src={entry.imagePath} alt="" aria-hidden width={40} height={40} className="max-h-10 w-auto object-contain" />
                          ) : (
                            <span className="text-[10px] font-semibold text-muted-foreground">{group.label}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-foreground">{entry.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{entry.subtitle}</div>
                        </div>
                      </CardLink>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-background px-4 py-6 text-sm text-muted-foreground">검색 결과가 없습니다.</div>
        )
      ) : (
        <div className="rounded-2xl bg-background px-4 py-4 text-sm text-muted-foreground">
          검색어를 입력하면 관련 포켓몬, 서식지, 기록, 의상, 요리, 아이템 결과를 함께 보여줍니다.
        </div>
      )}
    </section>
  );
}
