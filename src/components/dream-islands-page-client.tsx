'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MaterialTag from '@/components/material-tag';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import ZoomableImage from '@/components/zoomable-image';
import { displayName } from '@/lib/utils';
import type { DreamData } from '@/types/pokemon';

interface DreamIslandsPageClientProps {
  data: DreamData;
}

export default function DreamIslandsPageClient({ data }: DreamIslandsPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const dollImageByName = useMemo(() => new Map(data.dolls.map((doll) => [doll.nameJp, doll.imagePath])), [data.dolls]);

  const query = search.trim().toLowerCase();
  const filteredIslands = useMemo(() => {
    if (!query) {
      return data.islands;
    }

    return data.islands.filter((island) =>
      [
        island.nameKo,
        island.nameJp,
        island.requiredDollKo,
        island.requiredDollJp,
        island.requiredDollNoteKo,
        island.legendaryKo,
        island.legendaryJp,
        ...island.findingsKo,
        ...island.findingsJp,
        ...island.notesKo,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [data.islands, query]);

  const filteredDolls = useMemo(() => {
    if (!query) {
      return data.dolls;
    }

    return data.dolls.filter((doll) =>
      [doll.nameKo, doll.nameJp, doll.mapKo, doll.mapJp, doll.dreamIslandKo, doll.dreamIslandJp, doll.noteKo, doll.noteJp]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [data.dolls, query]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">꿈섬</h1>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="꿈섬, 인형, 전설, 획득물로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            <span className="mono font-semibold text-foreground">{filteredIslands.length + filteredDolls.length}</span>
            {search.trim() ? ` / ${data.islands.length + data.dolls.length}` : ''}개
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: '고정 꿈섬', value: data.islands.length },
          { label: '인형', value: data.dolls.length },
          { label: '관련 기록', value: data.summary.recordCount },
          { label: '직접 보상 기록', value: data.summary.directRewardCount },
          { label: '패션 보상 기록', value: data.summary.fashionRewardCount },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="text-xs font-semibold text-muted-foreground">{item.label}</div>
            <div className="mono mt-2 text-3xl font-bold text-pk-green-dark">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">꿈섬 목록</h2>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {filteredIslands.map((island) => (
            <article key={island.id} className="rounded-3xl border border-border bg-background p-5" style={{ contentVisibility: 'auto' }}>
              {dollImageByName.get(island.requiredDollJp) && (
                <div className="mb-4 flex justify-center">
                  <ZoomableImage
                    src={dollImageByName.get(island.requiredDollJp) ?? ''}
                    alt={displayName(island.requiredDollKo, island.requiredDollJp)}
                    width={120}
                    height={120}
                    className="h-24 w-24 rounded-2xl border border-border bg-card object-contain p-2"
                    buttonClassName="cursor-zoom-in"
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">필요 인형</span>
                {island.legendaryKo && (
                  <span className="rounded-full bg-pk-gold/20 px-2.5 py-1 text-[11px] font-semibold text-pk-brown-dark">전설 {island.legendaryKo}</span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-bold text-foreground">{displayName(island.nameKo, island.nameJp)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{displayName(island.requiredDollKo, island.requiredDollJp)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{island.requiredDollNoteKo || '-'}</p>

              <div className="mt-4">
                <div className="text-sm font-semibold text-foreground">주요 획득물</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {island.findingsKo.map((item, index) => (
                    <MaterialTag key={`${island.id}-finding-${index}`} material={item} />
                  ))}
                </div>
              </div>

              {island.notesKo.length > 0 && <div className="mt-4 rounded-2xl bg-card px-3 py-3 text-sm text-muted-foreground">{island.notesKo.join(' / ')}</div>}
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold text-foreground">인형별 연결</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filteredDolls.map((doll) => (
              <article key={doll.id} className="rounded-2xl border border-border bg-background p-4" style={{ contentVisibility: 'auto' }}>
                {doll.imagePath && (
                  <div className="mb-3 flex justify-center">
                    <ZoomableImage
                      src={doll.imagePath}
                      alt={displayName(doll.nameKo, doll.nameJp)}
                      width={120}
                      height={120}
                      className="h-20 w-20 rounded-2xl border border-border bg-card object-contain p-2"
                      buttonClassName="cursor-zoom-in"
                    />
                  </div>
                )}
                <h3 className="text-base font-bold text-foreground">{displayName(doll.nameKo, doll.nameJp)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">연결 꿈섬: {doll.dreamIslandKo}</p>
                <p className="mt-1 text-sm text-muted-foreground">주 획득 지역: {doll.mapKo}</p>
                {doll.noteKo && <p className="mt-1 text-sm text-muted-foreground">메모: {doll.noteKo}</p>}
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">기록 메모</h2>
          </div>
          <div className="rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground">{data.summary.notesKo.join(' / ')}</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.summary.directRewardTypes).map(([key, value]) => (
              <span key={key} className="rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground">
                {key} {value}
              </span>
            ))}
          </div>
          <div className="rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground">{data.notesKo.join(' / ')}</div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link prefetch={false} href="/records" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-pk-green hover:text-pk-green-dark">
              기록 보기
            </Link>
            <Link prefetch={false} href="/fashion" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-pk-green hover:text-pk-green-dark">
              의상 보기
            </Link>
          </div>
        </div>
      </section>

      {filteredIslands.length + filteredDolls.length === 0 && (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</div>
      )}
    </div>
  );
}
