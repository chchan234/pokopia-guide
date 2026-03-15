export interface PlannerPokemon {
  slug: string;
  number: string;
  name: string;
  officialName: string;
  sourceNationalDexNo: number;
  favoriteEnvironment: string | null;
  favoriteItems: string[];
  primaryMap: string;
}

export interface HouseAssignment {
  key: string;
  environment: string;
  members: PlannerPokemon[];
  exactFour: string[];
  exactThree: string[];
  exactTwo: string[];
  pairwiseOverlap: number;
  score: number;
}

export interface LeftoverEntry {
  pokemon: PlannerPokemon;
  reason: string;
}

export interface EnvironmentPlan {
  environment: string;
  houses: HouseAssignment[];
  leftovers: LeftoverEntry[];
  eligibleCount: number;
  calculationState: 'exact' | 'approx' | 'no_team';
  note: string | null;
}

interface BuildPlanResult {
  plans: EnvironmentPlan[];
  missingDataPokemon: PlannerPokemon[];
  totalHouseCount: number;
  totalLeftoverCount: number;
  totalEligibleCount: number;
}

// 두 포켓몬 간 취향 유사도 (공통 favoriteItems 수)
function similarity(a: PlannerPokemon, b: PlannerPokemon): number {
  const setB = new Set(b.favoriteItems);
  let count = 0;
  for (const item of a.favoriteItems) {
    if (setB.has(item)) count += 1;
  }
  return count;
}

// 4마리 팀의 점수 계산
function scoreTeam(members: PlannerPokemon[]): {
  exactFour: string[];
  exactThree: string[];
  exactTwo: string[];
  pairwiseOverlap: number;
  score: number;
} {
  const counts = new Map<string, number>();
  for (const m of members) {
    for (const item of m.favoriteItems) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }

  const exactFour: string[] = [];
  const exactThree: string[] = [];
  const exactTwo: string[] = [];

  for (const [item, count] of counts) {
    if (count === 4) exactFour.push(item);
    else if (count === 3) exactThree.push(item);
    else if (count === 2) exactTwo.push(item);
  }

  exactFour.sort((a, b) => a.localeCompare(b, 'ko'));
  exactThree.sort((a, b) => a.localeCompare(b, 'ko'));
  exactTwo.sort((a, b) => a.localeCompare(b, 'ko'));

  let pairwiseOverlap = 0;
  for (let i = 0; i < members.length - 1; i++) {
    for (let j = i + 1; j < members.length; j++) {
      pairwiseOverlap += similarity(members[i], members[j]);
    }
  }

  return {
    exactFour,
    exactThree,
    exactTwo,
    pairwiseOverlap,
    score: exactFour.length * 10000 + exactThree.length * 300 + exactTwo.length * 15 + pairwiseOverlap,
  };
}

// 클러스터링 기반 집 배치: 가장 비슷한 4마리씩 묶기
function clusterAssign(entries: PlannerPokemon[]): PlannerPokemon[][] {
  const remaining = [...entries];
  const houses: PlannerPokemon[][] = [];

  while (remaining.length >= 4) {
    // 시드: 남은 포켓몬 중 가장 취향이 많은 포켓몬을 시작점으로
    let seedIdx = 0;
    let maxItems = 0;
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].favoriteItems.length > maxItems) {
        maxItems = remaining[i].favoriteItems.length;
        seedIdx = i;
      }
    }

    const team: PlannerPokemon[] = [remaining[seedIdx]];
    const usedSpecies = new Set([remaining[seedIdx].sourceNationalDexNo]);
    remaining.splice(seedIdx, 1);

    // 나머지 3마리를 유사도 기준으로 선택
    while (team.length < 4 && remaining.length > 0) {
      let bestIdx = -1;
      let bestSim = -1;

      for (let i = 0; i < remaining.length; i++) {
        // 같은 종은 한 집에 못 들어감
        if (usedSpecies.has(remaining[i].sourceNationalDexNo)) continue;

        // 현재 팀 멤버들과의 총 유사도
        let totalSim = 0;
        for (const member of team) {
          totalSim += similarity(remaining[i], member);
        }

        if (totalSim > bestSim) {
          bestSim = totalSim;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) break; // 같은 종 제약으로 더 못 넣음

      usedSpecies.add(remaining[bestIdx].sourceNationalDexNo);
      team.push(remaining[bestIdx]);
      remaining.splice(bestIdx, 1);
    }

    if (team.length === 4) {
      houses.push(team);
    } else {
      // 4마리 못 채우면 다시 남은 풀에 돌려놓기
      remaining.push(...team);
      break;
    }
  }

  return houses;
}

// 로컬 서치: 집 간 포켓몬 교환으로 총 점수 개선
function localSearch(houses: PlannerPokemon[][], leftovers: PlannerPokemon[], maxIterations: number = 500): { houses: PlannerPokemon[][]; leftovers: PlannerPokemon[] } {
  let bestHouses = houses.map(h => [...h]);
  let bestLeftovers = [...leftovers];
  let bestTotalScore = bestHouses.reduce((sum, h) => sum + scoreTeam(h).score, 0);

  for (let iter = 0; iter < maxIterations; iter++) {
    let improved = false;

    // 전략 1: 두 집 간 멤버 1명씩 교환
    for (let i = 0; i < bestHouses.length - 1 && !improved; i++) {
      for (let j = i + 1; j < bestHouses.length && !improved; j++) {
        for (let mi = 0; mi < 4 && !improved; mi++) {
          for (let mj = 0; mj < 4 && !improved; mj++) {
            const a = bestHouses[i][mi];
            const b = bestHouses[j][mj];

            // 같은 종 제약 확인
            const speciesI = new Set(bestHouses[i].map((m, idx) => idx === mi ? b.sourceNationalDexNo : m.sourceNationalDexNo));
            const speciesJ = new Set(bestHouses[j].map((m, idx) => idx === mj ? a.sourceNationalDexNo : m.sourceNationalDexNo));
            if (speciesI.size < 4 || speciesJ.size < 4) continue;

            const newHouseI = bestHouses[i].map((m, idx) => idx === mi ? b : m);
            const newHouseJ = bestHouses[j].map((m, idx) => idx === mj ? a : m);

            const oldScore = scoreTeam(bestHouses[i]).score + scoreTeam(bestHouses[j]).score;
            const newScore = scoreTeam(newHouseI).score + scoreTeam(newHouseJ).score;

            if (newScore > oldScore) {
              bestHouses[i] = newHouseI;
              bestHouses[j] = newHouseJ;
              bestTotalScore += newScore - oldScore;
              improved = true;
            }
          }
        }
      }
    }

    // 전략 2: 남는 포켓몬과 집 멤버 교환
    if (!improved) {
      for (let hi = 0; hi < bestHouses.length && !improved; hi++) {
        for (let mi = 0; mi < 4 && !improved; mi++) {
          for (let li = 0; li < bestLeftovers.length && !improved; li++) {
            const houseM = bestHouses[hi][mi];
            const leftM = bestLeftovers[li];

            // 같은 종 제약
            const species = new Set(bestHouses[hi].map((m, idx) => idx === mi ? leftM.sourceNationalDexNo : m.sourceNationalDexNo));
            if (species.size < 4) continue;

            const newHouse = bestHouses[hi].map((m, idx) => idx === mi ? leftM : m);
            const oldScore = scoreTeam(bestHouses[hi]).score;
            const newScore = scoreTeam(newHouse).score;

            if (newScore > oldScore) {
              bestHouses[hi] = newHouse;
              bestLeftovers[li] = houseM;
              bestTotalScore += newScore - oldScore;
              improved = true;
            }
          }
        }
      }
    }

    if (!improved) break;
  }

  return { houses: bestHouses, leftovers: bestLeftovers };
}

function buildEnvironmentPlan(environment: string, entries: PlannerPokemon[]): EnvironmentPlan {
  // 정렬
  const sorted = [...entries].sort((a, b) => a.sourceNationalDexNo - b.sourceNationalDexNo || a.name.localeCompare(b.name, 'ko'));

  if (sorted.length < 4) {
    return {
      environment,
      houses: [],
      leftovers: sorted.map((pokemon) => ({
        pokemon,
        reason: '같은 환경에서 집 1채를 채울 4종이 부족함',
      })),
      eligibleCount: sorted.length,
      calculationState: 'no_team',
      note: '이 환경에서는 현재 보유 상태로 4마리 집을 만들 수 없습니다.',
    };
  }

  // 1단계: 클러스터링으로 초기 배치
  const initialHouses = clusterAssign(sorted);

  // 배치 안 된 포켓몬 수집
  const assigned = new Set(initialHouses.flat().map(p => p.slug));
  const initialLeftovers = sorted.filter(p => !assigned.has(p.slug));

  // 2단계: 로컬 서치로 품질 개선
  const { houses: finalHouses, leftovers: finalLeftovers } = localSearch(initialHouses, initialLeftovers);

  // HouseAssignment로 변환
  const houseAssignments: HouseAssignment[] = finalHouses.map((members, index) => {
    const scored = scoreTeam(members);
    return {
      key: `${environment}-${index + 1}-${members.map(m => m.slug).join('-')}`,
      environment,
      members,
      ...scored,
    };
  }).sort((a, b) =>
    b.score - a.score ||
    b.exactFour.length - a.exactFour.length ||
    a.members.map(m => m.name).join(', ').localeCompare(b.members.map(m => m.name).join(', '), 'ko')
  );

  const leftovers = finalLeftovers.map((pokemon) => ({
    pokemon,
    reason: houseAssignments.length > 0
      ? '집 수를 최대화하는 조합을 우선 배치하면서 이번 추천에서 제외됨'
      : '같은 환경에서 집 1채를 채울 4종이 부족함',
  })).sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name, 'ko'));

  return {
    environment,
    houses: houseAssignments,
    leftovers,
    eligibleCount: sorted.length,
    calculationState: 'exact',
    note: null,
  };
}

export function buildHousePlans(ownedPokemon: PlannerPokemon[]): BuildPlanResult {
  const missingData = ownedPokemon.filter((entry) => !entry.favoriteEnvironment || entry.favoriteItems.length === 0);
  const grouped = new Map<string, PlannerPokemon[]>();

  for (const entry of ownedPokemon) {
    if (!entry.favoriteEnvironment || entry.favoriteItems.length === 0) continue;
    const current = grouped.get(entry.favoriteEnvironment) ?? [];
    current.push(entry);
    grouped.set(entry.favoriteEnvironment, current);
  }

  const plans = Array.from(grouped.entries())
    .map(([environment, entries]) => buildEnvironmentPlan(environment, entries))
    .sort((a, b) => b.houses.length - a.houses.length || a.environment.localeCompare(b.environment, 'ko'));

  return {
    plans,
    missingDataPokemon: missingData.sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    totalHouseCount: plans.reduce((sum, plan) => sum + plan.houses.length, 0),
    totalLeftoverCount: plans.reduce((sum, plan) => sum + plan.leftovers.length, 0) + missingData.length,
    totalEligibleCount: plans.reduce((sum, plan) => sum + plan.eligibleCount, 0),
  };
}
