'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CollectionToggleButton from '@/components/collection-toggle-button';
import PreserveSearchLink from '@/components/preserve-search-link';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import { getFashionCollectionId } from '@/lib/collection';
import type { FashionCategory } from '@/types/pokemon';

interface FashionPageClientProps {
  categories: FashionCategory[];
}

export default function FashionPageClient({ categories }: FashionPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0);
  const unlockedByRecords = categories.reduce(
    (sum, category) => sum + category.items.filter((item) => item.unlockRecordIds.length > 0).length,
    0
  );

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          [item.name, ...item.unlockRecordNames, ...item.maps, category.label]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, search]);

  const filteredCount = filteredCategories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">의상</h1>
        <p className="mt-1 text-sm text-muted-foreground">총 {totalItems}개 아이템 · 인간의 기록 해금 {unlockedByRecords}개</p>
      </div>

      <div className="rounded-3xl border border-pk-green/20 bg-pk-green-light/30 p-5 text-sm leading-6 text-foreground">
        인간의 기록으로 직접 해금되는 의상은 기록 이름을 함께 표시했습니다.
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="의상명, 해금 기록, 지역으로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            <span className="mono font-semibold text-foreground">{filteredCount}</span>
            {search.trim() ? ` / ${totalItems}` : ''}개
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {filteredCategories.map((category) => (
          <a
            key={category.key}
            href={`#${category.key}`}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-pk-green hover:bg-pk-green-light"
          >
            {category.label}
            <span className="mono ml-1 text-muted-foreground">{category.items.length}</span>
          </a>
        ))}
      </div>

      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <section key={category.key} id={category.key} className="scroll-mt-20 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border bg-pk-brown-light/35 px-6 py-4">
              <h2 className="text-base font-bold text-foreground">{category.label}</h2>
              <span className="mono text-lg font-bold text-pk-brown-dark">{category.items.length}</span>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.items.map((item) => (
                <article key={`${category.key}-${item.name}`} className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-3 flex justify-end">
                    <CollectionToggleButton category="fashion" itemId={getFashionCollectionId(category.key, item.name)} compact />
                  </div>
                  <div className="flex h-[132px] items-center justify-center rounded-2xl bg-muted/30">
                    {item.imagePath ? (
                      <Image src={item.imagePath} alt={item.name} width={112} height={112} className="object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">이미지 준비 중</span>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-foreground">{item.name}</h3>
                  {item.unlockRecordNames.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] font-semibold text-pk-green-dark">해금 기록</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.unlockRecordNames.map((recordName, index) => {
                          const recordId = item.unlockRecordIds[index];
                          const key = `${item.name}-${recordName}`;

                          if (!recordId) {
                            return (
                              <span key={key} className="rounded-full bg-pk-green-light px-2 py-0.5 text-[11px] font-medium text-pk-green-dark">
                                {recordName}
                              </span>
                            );
                          }

                          return (
                            <PreserveSearchLink
                              key={key}
                              href={`/records/${recordId}`}
                              className="rounded-full bg-pk-green-light px-2 py-0.5 text-[11px] font-medium text-pk-green-dark hover:bg-pk-green hover:text-white"
                            >
                              {recordName}
                            </PreserveSearchLink>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] text-muted-foreground">현재 연결된 기록 해금 정보 없음</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredCount === 0 && <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</div>}
    </div>
  );
}
