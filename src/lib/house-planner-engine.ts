export const MAX_EXACT_ENV_SIZE = 36;
export const EXACT_TIMEOUT_MS = 2000;

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

interface TeamScore {
  indices: number[];
  exactFour: string[];
  exactThree: string[];
  exactTwo: string[];
  pairwiseOverlap: number;
  score: number;
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

interface SolveResult {
  teamCount: number;
  score: number;
  teamIds: number[];
}

interface TeamCandidate extends TeamScore {
  id: number;
  mask: bigint;
}

interface BuildEnvironmentPlanOptions {
  maxExactEnvSize?: number;
  exactTimeoutMs?: number;
}

interface BuildPlanResult {
  plans: EnvironmentPlan[];
  missingDataPokemon: PlannerPokemon[];
  totalHouseCount: number;
  totalLeftoverCount: number;
  totalEligibleCount: number;
}

const BIGINT_ZERO = BigInt(0);
const BIGINT_ONE = BigInt(1);
const EXACT_TIMEOUT_ERROR = 'EXACT_TIMEOUT';

function compareTeamScore(a: TeamScore, b: TeamScore) {
  return (
    b.score - a.score ||
    b.exactFour.length - a.exactFour.length ||
    b.exactThree.length - a.exactThree.length ||
    b.exactTwo.length - a.exactTwo.length ||
    b.pairwiseOverlap - a.pairwiseOverlap
  );
}

function compareHouseAssignment(a: HouseAssignment, b: HouseAssignment) {
  return (
    b.score - a.score ||
    b.exactFour.length - a.exactFour.length ||
    b.exactThree.length - a.exactThree.length ||
    b.exactTwo.length - a.exactTwo.length ||
    b.pairwiseOverlap - a.pairwiseOverlap ||
    a.members.map((member) => member.name).join(', ').localeCompare(b.members.map((member) => member.name).join(', '), 'ko')
  );
}

function buildTeamScore(indices: number[], entries: PlannerPokemon[], itemLists: string[][], pairOverlap: number[][]): TeamScore | null {
  const species = new Set<number>();

  for (const index of indices) {
    const dexNo = entries[index].sourceNationalDexNo;

    if (species.has(dexNo)) {
      return null;
    }

    species.add(dexNo);
  }

  const counts = new Map<string, number>();
  let totalPairwiseOverlap = 0;

  for (const index of indices) {
    for (const item of itemLists[index]) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }

  for (let i = 0; i < indices.length - 1; i += 1) {
    for (let j = i + 1; j < indices.length; j += 1) {
      totalPairwiseOverlap += pairOverlap[indices[i]][indices[j]];
    }
  }

  const exactFour: string[] = [];
  const exactThree: string[] = [];
  const exactTwo: string[] = [];

  for (const [item, count] of counts) {
    if (count === 4) {
      exactFour.push(item);
    } else if (count === 3) {
      exactThree.push(item);
    } else if (count === 2) {
      exactTwo.push(item);
    }
  }

  exactFour.sort((a, b) => a.localeCompare(b, 'ko'));
  exactThree.sort((a, b) => a.localeCompare(b, 'ko'));
  exactTwo.sort((a, b) => a.localeCompare(b, 'ko'));

  return {
    indices: [...indices].sort((a, b) => a - b),
    exactFour,
    exactThree,
    exactTwo,
    pairwiseOverlap: totalPairwiseOverlap,
    score: exactFour.length * 10000 + exactThree.length * 300 + exactTwo.length * 15 + totalPairwiseOverlap,
  };
}

function countBits(mask: bigint) {
  let count = 0;
  let value = mask;

  while (value > BIGINT_ZERO) {
    value &= value - BIGINT_ONE;
    count += 1;
  }

  return count;
}

function findLowestBitIndex(mask: bigint) {
  let index = 0;
  let value = mask;

  while ((value & BIGINT_ONE) === BIGINT_ZERO) {
    value >>= BIGINT_ONE;
    index += 1;
  }

  return index;
}

function betterSolveResult(candidate: SolveResult, current: SolveResult) {
  if (candidate.teamCount !== current.teamCount) {
    return candidate.teamCount > current.teamCount;
  }

  if (candidate.score !== current.score) {
    return candidate.score > current.score;
  }

  return candidate.teamIds.length > current.teamIds.length;
}

function buildCandidates(entries: PlannerPokemon[]) {
  const workingEntries = entries
    .map((entry) => ({
      ...entry,
      favoriteItems: Array.from(new Set(entry.favoriteItems)),
    }))
    .sort((a, b) => a.sourceNationalDexNo - b.sourceNationalDexNo || a.name.localeCompare(b.name, 'ko'));
  const itemLists = workingEntries.map((entry) => entry.favoriteItems);
  const pairOverlap = Array.from({ length: workingEntries.length }, () => Array<number>(workingEntries.length).fill(0));

  for (let i = 0; i < workingEntries.length; i += 1) {
    const itemSet = new Set(itemLists[i]);

    for (let j = i + 1; j < workingEntries.length; j += 1) {
      let overlap = 0;

      for (const item of itemLists[j]) {
        if (itemSet.has(item)) {
          overlap += 1;
        }
      }

      pairOverlap[i][j] = overlap;
      pairOverlap[j][i] = overlap;
    }
  }

  const teams: TeamCandidate[] = [];

  for (let first = 0; first < workingEntries.length - 3; first += 1) {
    for (let second = first + 1; second < workingEntries.length - 2; second += 1) {
      for (let third = second + 1; third < workingEntries.length - 1; third += 1) {
        for (let fourth = third + 1; fourth < workingEntries.length; fourth += 1) {
          const team = buildTeamScore([first, second, third, fourth], workingEntries, itemLists, pairOverlap);

          if (!team) {
            continue;
          }

          const id = teams.length;
          const mask =
            (BIGINT_ONE << BigInt(first)) |
            (BIGINT_ONE << BigInt(second)) |
            (BIGINT_ONE << BigInt(third)) |
            (BIGINT_ONE << BigInt(fourth));

          teams.push({
            id,
            mask,
            ...team,
          });
        }
      }
    }
  }

  return { workingEntries, teams };
}

function exactSolve(workingEntries: PlannerPokemon[], teams: TeamCandidate[], timeoutMs: number) {
  const teamsByMember = Array.from({ length: workingEntries.length }, () => [] as number[]);

  for (const team of teams) {
    for (const memberIndex of team.indices) {
      teamsByMember[memberIndex].push(team.id);
    }
  }

  const fullMask = (BIGINT_ONE << BigInt(workingEntries.length)) - BIGINT_ONE;
  const memo = new Map<bigint, SolveResult>();
  const startedAt = Date.now();
  let steps = 0;

  function checkTimeout() {
    steps += 1;
    if (steps % 4096 === 0 && Date.now() - startedAt > timeoutMs) {
      throw new Error(EXACT_TIMEOUT_ERROR);
    }
  }

  function solve(availableMask: bigint): SolveResult {
    checkTimeout();

    if (countBits(availableMask) < 4) {
      return { teamCount: 0, score: 0, teamIds: [] };
    }

    const memoized = memo.get(availableMask);

    if (memoized) {
      return memoized;
    }

    const pivot = findLowestBitIndex(availableMask);
    const maskWithoutPivot = availableMask & ~(BIGINT_ONE << BigInt(pivot));
    let best = solve(maskWithoutPivot);

    for (const teamId of teamsByMember[pivot]) {
      const team = teams[teamId];

      if ((team.mask & availableMask) !== team.mask) {
        continue;
      }

      const next = solve(availableMask ^ team.mask);
      const candidate: SolveResult = {
        teamCount: next.teamCount + 1,
        score: next.score + team.score,
        teamIds: [teamId, ...next.teamIds],
      };

      if (betterSolveResult(candidate, best)) {
        best = candidate;
      }
    }

    memo.set(availableMask, best);
    return best;
  }

  return solve(fullMask);
}

function greedySolve(teams: TeamCandidate[]) {
  const sortedTeams = [...teams].sort(compareTeamScore);
  let usedMask = BIGINT_ZERO;
  const selected: TeamCandidate[] = [];

  for (const team of sortedTeams) {
    if ((team.mask & usedMask) !== BIGINT_ZERO) {
      continue;
    }

    selected.push(team);
    usedMask |= team.mask;
  }

  return selected;
}

function mapSelectedTeams(environment: string, selectedTeams: TeamCandidate[], workingEntries: PlannerPokemon[]) {
  return selectedTeams
    .map((team, index) => ({
      key: `${environment}-${index + 1}-${team.indices.map((entryIndex) => workingEntries[entryIndex].slug).join('-')}`,
      environment,
      members: team.indices.map((entryIndex) => workingEntries[entryIndex]),
      exactFour: team.exactFour,
      exactThree: team.exactThree,
      exactTwo: team.exactTwo,
      pairwiseOverlap: team.pairwiseOverlap,
      score: team.score,
    }))
    .sort(compareHouseAssignment);
}

function buildEnvironmentPlan(
  environment: string,
  entries: PlannerPokemon[],
  { maxExactEnvSize = MAX_EXACT_ENV_SIZE, exactTimeoutMs = EXACT_TIMEOUT_MS }: BuildEnvironmentPlanOptions
): EnvironmentPlan {
  const { workingEntries, teams } = buildCandidates(entries);

  if (teams.length === 0) {
    return {
      environment,
      houses: [],
      leftovers: workingEntries
        .map((pokemon) => ({
          pokemon,
          reason: '같은 환경에서 집 1채를 채울 4종이 부족함',
        }))
        .sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name, 'ko')),
      eligibleCount: workingEntries.length,
      calculationState: 'no_team',
      note: '이 환경에서는 현재 보유 상태로 4마리 집을 만들 수 없습니다.',
    };
  }

  const mode: 'exact' | 'approx' =
    workingEntries.length > maxExactEnvSize
      ? 'approx'
      : 'exact';

  let selectedTeams: TeamCandidate[] = [];
  let note: string | null = null;
  let calculationState: 'exact' | 'approx' = mode;

  if (mode === 'exact') {
    try {
      const solved = exactSolve(workingEntries, teams, exactTimeoutMs);
      selectedTeams = solved.teamIds.map((id) => teams[id]);
    } catch (error) {
      if (error instanceof Error && error.message === EXACT_TIMEOUT_ERROR) {
        selectedTeams = greedySolve(teams);
        calculationState = 'approx';
        note = `정확 계산 시간이 길어져 근사 계산으로 전환했습니다.`;
      } else {
        throw error;
      }
    }
  } else {
    selectedTeams = greedySolve(teams);
    note = `이 환경은 보유 포켓몬이 ${maxExactEnvSize}마리를 넘어 근사 계산으로 처리했습니다.`;
  }

  let usedMask = BIGINT_ZERO;

  for (const team of selectedTeams) {
    usedMask |= team.mask;
  }

  const leftovers = workingEntries
    .filter((_, index) => (usedMask & (BIGINT_ONE << BigInt(index))) === BIGINT_ZERO)
    .map((pokemon) => ({
      pokemon,
      reason:
        selectedTeams.length > 0
          ? '집 수를 최대화하는 조합을 우선 배치하면서 이번 추천에서 제외됨'
          : '같은 환경에서 집 1채를 채울 4종이 부족함',
    }))
    .sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name, 'ko'));

  return {
    environment,
    houses: mapSelectedTeams(environment, selectedTeams, workingEntries),
    leftovers,
    eligibleCount: workingEntries.length,
    calculationState,
    note,
  };
}

export function buildHousePlans(
  ownedPokemon: PlannerPokemon[],
  options: BuildEnvironmentPlanOptions = {}
): BuildPlanResult {
  const missingData = ownedPokemon.filter((entry) => !entry.favoriteEnvironment || entry.favoriteItems.length === 0);
  const grouped = new Map<string, PlannerPokemon[]>();

  for (const entry of ownedPokemon) {
    if (!entry.favoriteEnvironment || entry.favoriteItems.length === 0) {
      continue;
    }

    const current = grouped.get(entry.favoriteEnvironment) ?? [];
    current.push(entry);
    grouped.set(entry.favoriteEnvironment, current);
  }

  const plans = Array.from(grouped.entries())
    .map(([environment, entries]) => buildEnvironmentPlan(environment, entries, options))
    .sort((a, b) => b.houses.length - a.houses.length || a.environment.localeCompare(b.environment, 'ko'));

  return {
    plans,
    missingDataPokemon: missingData.sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    totalHouseCount: plans.reduce((sum, plan) => sum + plan.houses.length, 0),
    totalLeftoverCount: plans.reduce((sum, plan) => sum + plan.leftovers.length, 0) + missingData.length,
    totalEligibleCount: plans.reduce((sum, plan) => sum + plan.eligibleCount, 0),
  };
}
