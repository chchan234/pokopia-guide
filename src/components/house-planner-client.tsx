'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection } from '@/components/collection-provider';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import {
  buildHousePlans,
  MAX_EXACT_ENV_SIZE,
  type EnvironmentPlan,
  type PlannerPokemon,
} from '@/lib/house-planner-engine';

interface HousePlannerClientProps {
  pokemon: PlannerPokemon[];
}

interface PlanSnapshot {
  plans: EnvironmentPlan[];
  missingDataPokemon: PlannerPokemon[];
  totalHouseCount: number;
  totalLeftoverCount: number;
  totalEligibleCount: number;
}

interface PlannerWorkerRequest {
  requestId: number;
  ownedPokemon: PlannerPokemon[];
}

interface PlannerWorkerResponse {
  requestId: number;
  result: PlanSnapshot;
}

function createPlannerWorker() {
  try {
    return new Worker(new URL('../workers/house-planner.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }
}

const EMPTY_PLAN_SNAPSHOT: PlanSnapshot = {
  plans: [],
  missingDataPokemon: [],
  totalHouseCount: 0,
  totalLeftoverCount: 0,
  totalEligibleCount: 0,
};

export default function HousePlannerClient({ pokemon }: HousePlannerClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const { hydrated, pokemonOwnedSet } = useCollection();
  const [search, setSearch] = useState(querySearch);
  const [snapshot, setSnapshot] = useState<PlanSnapshot>(EMPTY_PLAN_SNAPSHOT);
  const workerRef = useRef<Worker | null>(null);
  const latestRequestIdRef = useRef(0);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const ownedPokemon = useMemo(
    () => pokemon.filter((entry) => pokemonOwnedSet.has(entry.slug)),
    [pokemon, pokemonOwnedSet]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const currentRequestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = currentRequestId;

    if (typeof Worker === 'undefined') {
      queueMicrotask(() => {
        if (latestRequestIdRef.current !== currentRequestId) {
          return;
        }

        setSnapshot(buildHousePlans(ownedPokemon));
      });
      return;
    }

    if (!workerRef.current) {
      workerRef.current = createPlannerWorker();
    }

    const worker = workerRef.current;

    if (!worker) {
      queueMicrotask(() => {
        if (latestRequestIdRef.current !== currentRequestId) {
          return;
        }

        setSnapshot(buildHousePlans(ownedPokemon));
      });
      return;
    }

    const handleMessage = (event: MessageEvent<PlannerWorkerResponse>) => {
      if (event.data.requestId !== currentRequestId) {
        return;
      }

      setSnapshot(event.data.result);
    };

    const handleError = () => {
      if (latestRequestIdRef.current !== currentRequestId) {
        return;
      }

      setSnapshot(buildHousePlans(ownedPokemon));
    };

    worker.addEventListener('message', handleMessage as EventListener);
    worker.addEventListener('error', handleError);
    worker.postMessage({
      requestId: currentRequestId,
      ownedPokemon,
    } satisfies PlannerWorkerRequest);

    return () => {
      worker.removeEventListener('message', handleMessage as EventListener);
      worker.removeEventListener('error', handleError);
    };
  }, [ownedPokemon]);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const { plans, missingDataPokemon, totalHouseCount, totalLeftoverCount, totalEligibleCount } = snapshot;

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return plans;
    }

    return plans.filter((plan) => {
      if (plan.environment.toLowerCase().includes(query)) {
        return true;
      }

      if (plan.houses.some((house) => house.members.some((member) => member.name.toLowerCase().includes(query) || member.number.includes(query)))) {
        return true;
      }

      return plan.leftovers.some((entry) => entry.pokemon.name.toLowerCase().includes(query) || entry.pokemon.number.includes(query));
    });
  }, [plans, search]);

  const filteredMissingDataPokemon = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return missingDataPokemon;
    }

    return missingDataPokemon.filter((entry) => entry.name.toLowerCase().includes(query) || entry.number.includes(query));
  }, [missingDataPokemon, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">집 추천</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          체크한 포켓몬 전체를 환경별로 4마리 집으로 나눕니다. 각 환경 안에서는 집 수를 최대로 만들고, 그 안에서 좋아하는 것 겹침이 큰 배치를 선택합니다.
        </p>
        {!hydrated && <p className="mt-2 text-xs text-muted-foreground">브라우저 저장된 포켓몬 체크 상태를 불러오는 중입니다.</p>}
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { label: '체크한 포켓몬', value: pokemonOwnedSet.size },
          { label: '배치 가능 데이터', value: totalEligibleCount },
          { label: '완성된 집', value: totalHouseCount },
          { label: '남는 포켓몬', value: totalLeftoverCount },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="mono text-2xl font-bold text-pk-green">{item.value}</div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="환경명, 포켓몬 이름, 번호로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            <span className="mono font-semibold text-foreground">{filteredPlans.length}</span>
            {search.trim() ? ` / ${plans.length}` : ''}개 환경
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-base font-bold text-foreground">배치 기준</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>1. 같은 집 4마리는 좋아하는 환경이 반드시 같습니다.</li>
          <li>2. 체크한 포켓몬은 한 번만 배치됩니다.</li>
          <li>3. 환경별로 집 수를 먼저 최대화합니다.</li>
          <li>4. 동수일 때 4마리 공통 좋아하는 것, 3마리 공통 좋아하는 것이 많은 조합을 우선합니다.</li>
          <li>5. 환경별 최대 {MAX_EXACT_ENV_SIZE}마리까지 정확 계산하며, 그 이상 또는 시간 초과 시 근사 계산으로 전환됩니다.</li>
        </ul>
      </section>

      {filteredPlans.length > 0 ? (
        <section className="space-y-8">
          {filteredPlans.map((plan) => (
            <section key={plan.environment} className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{plan.environment}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    배치 가능 {plan.eligibleCount}마리 · 완성된 집 {plan.houses.length}채 · 남는 포켓몬 {plan.leftovers.length}마리
                  </p>
                  {plan.note && <p className="mt-2 text-xs font-semibold text-pk-brown-dark">{plan.note}</p>}
                </div>
              </div>

              {plan.houses.length > 0 ? (
                <div className="space-y-4">
                  {plan.houses.map((house, index) => (
                    <article key={house.key} className="rounded-3xl border border-border bg-card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="mono rounded-full bg-pk-green-light px-3 py-1 text-xs font-bold text-pk-green-dark">
                              집 {index + 1}
                            </span>
                            <span className="rounded-full bg-pk-brown-light px-3 py-1 text-xs font-semibold text-pk-brown-dark">
                              환경 {house.environment}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg font-bold text-foreground">{house.members.map((member) => member.name).join(' · ')}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            4마리 공통 {house.exactFour.length}개 · 3마리 공통 {house.exactThree.length}개 · 2마리 공통 {house.exactTwo.length}개
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {house.members.map((member) => (
                          <Link
                            key={member.slug}
                            href={`/pokemon/${member.slug}`}
                            className="rounded-2xl border border-border bg-background p-4 hover:border-pk-green"
                          >
                            <div className="mono text-[11px] text-muted-foreground">#{member.number}</div>
                            <div className="mt-1 text-sm font-bold text-foreground">{member.name}</div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{member.primaryMap}</div>
                          </Link>
                        ))}
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-[11px] font-semibold text-pk-green-dark">4마리 공통 좋아하는 것</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {house.exactFour.length > 0 ? (
                              house.exactFour.map((item) => (
                                <span key={`${house.key}-all-${item}`} className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-muted-foreground">4마리 모두 겹치는 좋아하는 것은 없습니다.</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-pk-brown-dark">3마리 공통 좋아하는 것</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {house.exactThree.length > 0 ? (
                              house.exactThree.map((item) => (
                                <span key={`${house.key}-three-${item}`} className="rounded-full bg-pk-brown-light px-2.5 py-1 text-[11px] font-semibold text-pk-brown-dark">
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-muted-foreground">3마리 공통 좋아하는 것은 없습니다.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
                  {plan.calculationState === 'no_team'
                    ? '이 환경에서는 집을 완성할 4마리 배치가 아직 없습니다.'
                    : '근사 계산 결과에서도 집을 완성할 4마리 배치가 아직 없습니다.'}
                </div>
              )}

              {plan.leftovers.length > 0 && (
                <section className="rounded-3xl border border-border bg-card p-5">
                  <h3 className="text-base font-bold text-foreground">남는 포켓몬</h3>
                  <p className="mt-1 text-xs text-muted-foreground">집 수를 최대화하는 배치를 먼저 확정한 뒤, 남은 포켓몬 목록입니다.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {plan.leftovers.map((entry) => (
                      <article key={`${plan.environment}-${entry.pokemon.slug}`} className="rounded-2xl border border-border bg-background p-4">
                        <div className="mono text-[11px] text-muted-foreground">#{entry.pokemon.number}</div>
                        <Link href={`/pokemon/${entry.pokemon.slug}`} className="mt-1 block text-sm font-bold text-foreground hover:text-pk-green-dark">
                          {entry.pokemon.name}
                        </Link>
                        <p className="mt-2 text-[11px] text-muted-foreground">{entry.reason}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </section>
          ))}
        </section>
      ) : search.trim() ? (
        <section className="rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="text-base font-bold text-foreground">검색 결과가 없습니다.</h2>
          <p className="mt-2 text-sm text-muted-foreground">환경명이나 포켓몬 이름, 번호를 다시 확인해 주세요.</p>
        </section>
      ) : (
        <section className="rounded-3xl border border-border bg-card p-8 text-center">
          <h2 className="text-base font-bold text-foreground">아직 배치할 포켓몬이 없습니다.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link href="/collection" className="font-semibold text-pk-green-dark underline underline-offset-4">
              내 수집
            </Link>
            에서 포켓몬을 먼저 체크해 주세요.
          </p>
        </section>
      )}

      {filteredMissingDataPokemon.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="text-base font-bold text-foreground">배치 제외 포켓몬</h2>
          <p className="mt-1 text-sm text-muted-foreground">좋아하는 환경 또는 좋아하는 것 데이터가 비어 있어 현재 배치 계산에서 제외된 포켓몬입니다.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {filteredMissingDataPokemon.map((entry) => (
              <Link
                key={entry.slug}
                href={`/pokemon/${entry.slug}`}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-pk-green"
              >
                #{entry.number} {entry.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
