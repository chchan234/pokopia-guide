'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CollectionToggleButton from '@/components/collection-toggle-button';
import PreserveSearchLink from '@/components/preserve-search-link';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import { recordMapOrder } from '@/lib/constants';
import type { HumanRecord } from '@/types/pokemon';

interface RecordsPageClientProps {
  records: HumanRecord[];
}

const mapRoutes: Record<string, string> = {
  '메마른 황야 마을': '서쪽 입구 → 동쪽 게이트 → 포켓몬센터 주변 → 북동쪽 고지대',
  '우중충한 해변 마을': '포켓몬센터 주변 → 서쪽 발전 시설 → 북동쪽 동굴 → 배 상층',
  '울퉁불퉁 산마을': '포켓몬센터 주변 → 박물관 → 지하 동굴 → 남쪽 폐허',
  '반짝반짝 부유섬 마을': '중앙 섬 → 북서쪽 섬 → 도장 → 동쪽 섬 → 남동쪽 지하 구역',
  '꿈섬': '중앙 동굴 우선 수색 → 조건 해제 후 예외 기록 회수',
};

const mapNotes: Record<string, string | null> = {
  '메마른 황야 마을': null,
  '우중충한 해변 마을': '파도타기 필요 구간이 있어 초반에는 전부 회수할 수 없습니다.',
  '울퉁불퉁 산마을': '괴력 해금 후 재방문이 필요한 기록이 있습니다.',
  '반짝반짝 부유섬 마을': '섬이 분산돼 있어 체크리스트를 같이 보는 편이 안전합니다.',
  '꿈섬': '이상한 무늬 10개와 조건부 기록이 섞여 있습니다.',
};

export default function RecordsPageClient({ records }: RecordsPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const rewardRecords = useMemo(() => records.filter((record) => record.hasDirectReward), [records]);
  const hairCount = rewardRecords.filter((record) => record.directRewardType === '헤어').length;
  const coordCount = rewardRecords.filter((record) => record.directRewardType === '코디 세트').length;
  const emoteCount = rewardRecords.filter((record) => record.directRewardType === '감정표현').length;

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return records;
    }

    return records.filter((record) =>
      [
        record.name,
        record.map,
        record.type,
        record.locationDetail,
        record.directReward,
        record.directRewardType,
        String(record.id),
        String(record.orderInType),
        ...record.fashionRewards.map((reward) => reward.name),
        ...record.fashionRewards.map((reward) => reward.category),
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [records, search]);

  const groupedByMap = useMemo(
    () =>
      recordMapOrder
        .map((map) => ({
          map,
          records: filteredRecords.filter((record) => record.map === map),
        }))
        .filter((entry) => entry.records.length > 0),
    [filteredRecords]
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">기록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          총 {records.length}개 · 직접 보상 {rewardRecords.length}개 · 코디 {coordCount} · 헤어 {hairCount} · 감정표현 {emoteCount}
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="기록명, 번호, 지역, 보상, 위치로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            <span className="mono font-semibold text-foreground">{filteredRecords.length}</span>
            {search.trim() ? ` / ${records.length}` : ''}개
          </p>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: '전체 기록', value: records.length },
          { label: '직접 보상', value: rewardRecords.length },
          { label: '패션 연계', value: records.filter((record) => record.hasFashionReward).length },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="mono text-2xl font-bold text-pk-green">{item.value}</div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {groupedByMap.map(({ map, records: groupedRecords }) => (
          <section key={map} className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="border-b border-border bg-pk-green-light/30 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{map}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">추천 동선: {mapRoutes[map]}</p>
                  {mapNotes[map] && <p className="mt-2 text-xs text-pk-brown-dark">주의: {mapNotes[map]}</p>}
                </div>
                <span className="mono rounded-full bg-card px-3 py-1 text-sm font-bold text-pk-green-dark">{groupedRecords.length}</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {groupedRecords.map((record) => (
                <article key={record.id} className="px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="mono text-xs text-muted-foreground">#{String(record.id).padStart(3, '0')}</span>
                        <span className="rounded-full bg-pk-brown-light px-2 py-0.5 text-[11px] font-semibold text-pk-brown-dark">
                          {record.type} {record.orderInType}
                        </span>
                      </div>
                      <PreserveSearchLink href={`/records/${record.id}`} className="mt-2 block text-base font-bold text-foreground hover:text-pk-green-dark">
                        {record.name}
                      </PreserveSearchLink>
                      <p className="mt-1 text-sm text-muted-foreground">{record.locationDetail}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <CollectionToggleButton category="records" itemId={record.id} compact />
                      {record.directReward && (
                        <div className="max-w-full rounded-2xl bg-pk-green-light px-3 py-2 sm:text-right">
                          <div className="text-[11px] font-semibold text-pk-green-dark">{record.directRewardType}</div>
                          <div className="break-words text-sm font-bold text-foreground">{record.directReward}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {record.fashionRewards.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {record.fashionRewards.map((reward) => (
                        <span key={`${record.id}-${reward.category}-${reward.name}`} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-foreground">
                          {reward.category}: {reward.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredRecords.length === 0 && <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</div>}
    </div>
  );
}
