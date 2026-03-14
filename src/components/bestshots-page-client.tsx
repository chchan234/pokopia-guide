'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import { useCollection } from '@/components/collection-provider';
import OwnedToggle from '@/components/owned-toggle';
import { isOwnershipFilter, matchesOwnershipFilter, type OwnershipFilter } from '@/lib/collection';
import type { BestshotEntry } from '@/types/pokemon';

interface BestshotsPageClientProps {
  bestshots: BestshotEntry[];
}

export default function BestshotsPageClient({ bestshots }: BestshotsPageClientProps) {
  const searchParams = useSearchParams();
  const queryQ = searchParams.get('q') ?? '';
  const queryOwned = searchParams.get('owned');
  const [search, setSearch] = useState(queryQ);
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>(isOwnershipFilter(queryOwned) ? queryOwned : 'all');
  const { bestshotOwnedSet, toggleBestshot } = useCollection();

  const syncedParams = useMemo(
    () => ({ q: search, owned: ownershipFilter === 'all' ? undefined : ownershipFilter }),
    [search, ownershipFilter]
  );
  useSyncQueryParams(syncedParams);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bestshots.filter((bs) => {
      const owned = bestshotOwnedSet.has(bs.id);
      if (!matchesOwnershipFilter(owned, ownershipFilter)) return false;
      if (!query) return true;

      return (
        (bs.nameKo ?? bs.nameJp).toLowerCase().includes(query) ||
        bs.conditionKo.toLowerCase().includes(query) ||
        bs.rewardKo.toLowerCase().includes(query) ||
        String(bs.number).includes(query)
      );
    });
  }, [bestshots, bestshotOwnedSet, ownershipFilter, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">베스트샷</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          총 {bestshots.length}개 · 특정 조건에서 셔터찬스가 발동되면 카메라로 촬영하여 등록
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="이름, 조건, 보상으로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            {([
              { key: 'all', label: '전체' },
              { key: 'owned', label: '보유만' },
              { key: 'missing', label: '미보유만' },
            ] as const).map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setOwnershipFilter(filter.key)}
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

        <p className="mt-3 text-xs text-muted-foreground">
          <span className="mono font-semibold text-foreground">{filtered.length}</span>
          {ownershipFilter !== 'all' || search.trim() ? ` / ${bestshots.length}` : ''}개
          <span className="ml-2">·</span>
          <span className="ml-2 mono font-semibold text-pk-green-dark">{bestshotOwnedSet.size}</span>
          <span>개 보유</span>
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((bs) => (
            <article
              key={bs.id}
              className="overflow-hidden rounded-3xl border border-border bg-background"
              style={{ contentVisibility: 'auto' }}
            >
              {bs.imagePath && (
                <div className="relative aspect-video w-full bg-muted">
                  <Image
                    src={bs.imagePath}
                    alt={bs.nameKo || bs.nameJp}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="mono text-xs text-muted-foreground">#{String(bs.number).padStart(2, '0')}</span>
                      <h3 className="text-sm font-bold text-foreground">{bs.nameKo || bs.nameJp}</h3>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{bs.conditionKo}</p>
                    {bs.rewardKo !== '없음' && (
                      <p className="mt-1.5 text-xs font-medium text-pk-green-dark">{bs.rewardKo}</p>
                    )}
                  </div>
                  <OwnedToggle
                    owned={bestshotOwnedSet.has(bs.id)}
                    onToggle={() => toggleBestshot(bs.id)}
                    compact
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">조건에 맞는 베스트샷이 없습니다.</div>
        )}
      </section>
    </div>
  );
}
