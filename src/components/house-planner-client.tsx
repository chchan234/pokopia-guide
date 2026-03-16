'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection } from '@/components/collection-provider';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import {
  buildHousePlans,
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

// localStorage 저장 형식
interface StoredPlan {
  ownedSlugs: string[];
  snapshot: PlanSnapshot;
}

const STORAGE_KEY = 'pokopia-guide:house-planner:v1';
const PLACED_KEY = 'pokopia-guide:house-planner:placed';

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

// 두 slug 배열이 동일한 조합인지 비교 (순서 무관)
function isSameSlugs(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((slug) => setA.has(slug));
}

function loadStoredPlan(): StoredPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPlan;
  } catch {
    return null;
  }
}

function saveStoredPlan(ownedSlugs: string[], snapshot: PlanSnapshot): void {
  try {
    const value: StoredPlan = { ownedSlugs, snapshot };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage 저장 실패 시 무시
  }
}

function loadPlacedKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(PLACED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function savePlacedKeys(keys: Set<string>): void {
  try {
    localStorage.setItem(PLACED_KEY, JSON.stringify([...keys]));
  } catch {
    // 저장 실패 시 무시
  }
}

export default function HousePlannerClient({ pokemon }: HousePlannerClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const { hydrated, pokemonOwnedSet } = useCollection();
  const [search, setSearch] = useState(querySearch);
  const [snapshot, setSnapshot] = useState<PlanSnapshot>(EMPTY_PLAN_SNAPSHOT);
  // 계산이 한 번이라도 완료된 적 있는지 여부 (빈 상태 vs 계산된 결과 구분)
  const [hasResult, setHasResult] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [placedKeys, setPlacedKeys] = useState<Set<string>>(new Set());
  const workerRef = useRef<Worker | null>(null);
  const latestRequestIdRef = useRef(0);
  const nextUnplacedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const ownedPokemon = useMemo(
    () => pokemon.filter((entry) => pokemonOwnedSet.has(entry.slug)),
    [pokemon, pokemonOwnedSet]
  );

  // 페이지 진입 시 localStorage에서 이전 결과 복원
  useEffect(() => {
    if (!hydrated) return;

    setPlacedKeys(loadPlacedKeys());

    const stored = loadStoredPlan();
    if (!stored) return;

    const currentSlugs = ownedPokemon.map((p) => p.slug);
    if (isSameSlugs(stored.ownedSlugs, currentSlugs)) {
      setSnapshot(stored.snapshot);
      setHasResult(true);
    }
  // hydrated가 true로 바뀌는 시점 한 번만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // 계산 실행 함수 (버튼에서 호출)
  const runCalculation = useCallback(() => {
    if (typeof window === 'undefined') return;

    setIsCalculating(true);

    const currentRequestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = currentRequestId;

    const currentOwnedPokemon = ownedPokemon;

    const handleResult = (result: PlanSnapshot) => {
      if (latestRequestIdRef.current !== currentRequestId) return;

      const ownedSlugs = currentOwnedPokemon.map((p) => p.slug);
      saveStoredPlan(ownedSlugs, result);
      setSnapshot(result);
      setHasResult(true);
      setIsCalculating(false);
    };

    if (typeof Worker === 'undefined') {
      queueMicrotask(() => {
        handleResult(buildHousePlans(currentOwnedPokemon));
      });
      return;
    }

    if (!workerRef.current) {
      workerRef.current = createPlannerWorker();
    }

    const worker = workerRef.current;

    if (!worker) {
      queueMicrotask(() => {
        handleResult(buildHousePlans(currentOwnedPokemon));
      });
      return;
    }

    const handleMessage = (event: MessageEvent<PlannerWorkerResponse>) => {
      if (event.data.requestId !== currentRequestId) return;

      worker.removeEventListener('message', handleMessage as EventListener);
      worker.removeEventListener('error', handleError);
      handleResult(event.data.result);
    };

    const handleError = () => {
      if (latestRequestIdRef.current !== currentRequestId) return;

      worker.removeEventListener('message', handleMessage as EventListener);
      worker.removeEventListener('error', handleError);
      handleResult(buildHousePlans(currentOwnedPokemon));
    };

    worker.addEventListener('message', handleMessage as EventListener);
    worker.addEventListener('error', handleError);
    worker.postMessage({
      requestId: currentRequestId,
      ownedPokemon: currentOwnedPokemon,
    } satisfies PlannerWorkerRequest);
  }, [ownedPokemon]);

  // 언마운트 시 워커 정리
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const togglePlaced = useCallback((houseKey: string) => {
    setPlacedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(houseKey)) {
        next.delete(houseKey);
      } else {
        next.add(houseKey);
        // 배치완료 후 다음 미배치 집으로 스크롤
        requestAnimationFrame(() => {
          nextUnplacedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      savePlacedKeys(next);
      return next;
    });
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

      if (
        plan.houses.some((house) =>
          [...house.exactFour, ...house.exactThree].some((entry) => entry.toLowerCase().includes(query))
        )
      ) {
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

      {/* 추천받기 버튼 */}
      <section className="flex items-center gap-4">
        <button
          type="button"
          onClick={runCalculation}
          disabled={isCalculating || ownedPokemon.length < 4}
          className="rounded-2xl bg-pk-green px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-pk-green-dark transition-colors"
        >
          {isCalculating ? '계산 중...' : '추천받기'}
        </button>
        {ownedPokemon.length < 4 && !isCalculating && (
          <p className="text-sm text-muted-foreground">집 1채를 완성하려면 같은 환경 포켓몬이 4마리 이상 필요합니다.</p>
        )}
      </section>

      {/* 로딩 UI */}
      {isCalculating && (
        <section className="rounded-3xl border border-border bg-card p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-pk-green" />
            <p className="text-sm font-semibold text-foreground">집 추천 중...</p>
            <p className="text-xs text-muted-foreground">포켓몬 수에 따라 수 초가 걸릴 수 있습니다.</p>
          </div>
        </section>
      )}

      {!isCalculating && (
        <>
          <section className="rounded-3xl border border-border bg-card p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="환경명, 포켓몬 이름, 번호로 검색"
                aria-label="집 추천 검색"
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
              <li>4. 동수일 때 4마리 공통 좋아하는 것이 많은 조합을 우선합니다.</li>
              <li>5. 포켓몬 수가 많은 환경은 근사 계산(그리디 + 로컬 서치)으로 처리됩니다.</li>
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

                  {plan.houses.filter((h) => !placedKeys.has(h.key)).length > 0 ? (
                    <div className="space-y-4">
                      {plan.houses.filter((h) => !placedKeys.has(h.key)).map((house, index, arr) => {
                        // 다음 미배치 집의 ref 설정 (스크롤용)
                        const isFirstUnplaced = index === 0;
                        return (
                        <article
                          key={house.key}
                          ref={isFirstUnplaced ? (el) => { nextUnplacedRef.current = el; } : undefined}
                          className="rounded-3xl border border-border bg-card p-5"
                        >
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
                            <button
                              type="button"
                              onClick={() => togglePlaced(house.key)}
                              className="shrink-0 rounded-full bg-pk-green px-4 py-2 text-xs font-bold text-white hover:bg-pk-green-dark transition-colors"
                            >
                              배치완료
                            </button>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {house.members.map((member) => (
                              <Link
                                prefetch={false}
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
                        );
                      })}
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
                            <Link prefetch={false} href={`/pokemon/${entry.pokemon.slug}`} className="mt-1 block text-sm font-bold text-foreground hover:text-pk-green-dark">
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
          ) : hasResult && search.trim() ? (
            <section className="rounded-3xl border border-border bg-card p-8 text-center">
              <h2 className="text-base font-bold text-foreground">검색 결과가 없습니다.</h2>
              <p className="mt-2 text-sm text-muted-foreground">환경명이나 포켓몬 이름, 번호를 다시 확인해 주세요.</p>
            </section>
          ) : hasResult ? (
            <section className="rounded-3xl border border-border bg-card p-8 text-center">
              <h2 className="text-base font-bold text-foreground">아직 배치할 포켓몬이 없습니다.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                <Link prefetch={false} href="/collection" className="font-semibold text-pk-green-dark underline underline-offset-4">
                  내 수집
                </Link>
                에서 포켓몬을 먼저 체크해 주세요.
              </p>
            </section>
          ) : (
            <section className="rounded-3xl border border-border bg-card p-8 text-center">
              <h2 className="text-base font-bold text-foreground">추천받기 버튼을 눌러 집 배치를 계산하세요.</h2>
              <p className="mt-2 text-sm text-muted-foreground">포켓몬 체크 조합이 바뀌었을 때도 버튼을 다시 눌러 재계산할 수 있습니다.</p>
            </section>
          )}

          {/* 배치 완료된 집 섹션 */}
          {(() => {
            const allPlacedHouses = filteredPlans.flatMap((plan) =>
              plan.houses.filter((h) => placedKeys.has(h.key)).map((house) => ({ house, environment: plan.environment }))
            );
            if (allPlacedHouses.length === 0) return null;
            return (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">배치 완료된 집 ({allPlacedHouses.length})</h2>
                  <button
                    type="button"
                    onClick={() => { setPlacedKeys(new Set()); savePlacedKeys(new Set()); }}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-pk-green hover:text-pk-green-dark transition-colors"
                  >
                    전체 초기화
                  </button>
                </div>
                <div className="space-y-3">
                  {allPlacedHouses.map(({ house, environment }) => (
                    <article key={house.key} className="rounded-3xl border border-pk-green/30 bg-pk-green-light/30 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-pk-green px-2.5 py-0.5 text-[11px] font-bold text-white">완료</span>
                            <span className="text-xs font-semibold text-muted-foreground">{environment}</span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-foreground">{house.members.map((m) => m.name).join(' · ')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => togglePlaced(house.key)}
                          className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })()}

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
        </>
      )}
    </div>
  );
}
