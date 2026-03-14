'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import { getQueryArray } from '@/lib/url-state';
import type { Pokemon } from '@/types/pokemon';
import PokemonCard from './pokemon-card';

type FavoriteMatchMode = 'any' | 'all';

interface FavoriteOption {
  key: string;
  label: string;
  count: number;
}

function compareKo(a: string, b: string) {
  return a.localeCompare(b, 'ko');
}

function normalizeFavoriteKey(value: string) {
  return value
    .trim()
    .replace(/\s+/g, '')
    .replace(/[·・]/g, '')
    .toLowerCase();
}

function getFavoriteLabels(entry: Pokemon) {
  return Array.from(
    new Set(
      [...entry.favoriteItems, ...entry.favoriteItemVariants.flat()]
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function chooseFavoriteLabel(current: string | undefined, candidate: string) {
  if (!current) return candidate;
  const currentHasSpace = /\s/.test(current);
  const candidateHasSpace = /\s/.test(candidate);
  if (candidateHasSpace && !currentHasSpace) return candidate;
  return current.length <= candidate.length ? current : candidate;
}

export default function PokemonFilter({
  pokemon,
  types,
  specialties,
  mapNames,
}: {
  pokemon: Pokemon[];
  types: string[];
  specialties: string[];
  mapNames: string[];
}) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const queryType = searchParams.get('type') ?? '';
  const queryMap = searchParams.get('map') ?? '';
  const querySpecialty = searchParams.get('specialty') ?? '';
  const queryEnvironment = searchParams.get('environment') ?? '';
  const querySpecialFilter = searchParams.get('special') ?? '';
  const queryFavoriteKeys = useMemo(() => getQueryArray(searchParams, 'favorite'), [searchParams]);
  const queryFavoriteMatchMode = searchParams.get('favoriteMode') === 'any' ? 'any' : 'all';
  const queryIncludeUnknownFavorites = searchParams.get('includeUnknown') === '1';
  const [search, setSearch] = useState(querySearch);
  const [selectedType, setSelectedType] = useState(queryType);
  const [selectedMap, setSelectedMap] = useState(queryMap);
  const [selectedSpecialty, setSelectedSpecialty] = useState(querySpecialty);
  const [selectedEnvironment, setSelectedEnvironment] = useState(queryEnvironment);
  const [specialFilter, setSpecialFilter] = useState(querySpecialFilter);
  const [showFavoriteFilter, setShowFavoriteFilter] = useState(false);
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [selectedFavoriteKeys, setSelectedFavoriteKeys] = useState<string[]>(queryFavoriteKeys);
  const [favoriteMatchMode, setFavoriteMatchMode] = useState<FavoriteMatchMode>(queryFavoriteMatchMode);
  const [includeUnknownFavorites, setIncludeUnknownFavorites] = useState(queryIncludeUnknownFavorites);

  // URL 쿼리 파라미터가 바뀔 때 로컬 상태를 한번에 동기화
  useEffect(() => {
    setSearch(querySearch);
    setSelectedType(queryType);
    setSelectedMap(queryMap);
    setSelectedSpecialty(querySpecialty);
    setSelectedEnvironment(queryEnvironment);
    setSpecialFilter(querySpecialFilter);
    setSelectedFavoriteKeys(queryFavoriteKeys);
    setFavoriteMatchMode(queryFavoriteMatchMode);
    setIncludeUnknownFavorites(queryIncludeUnknownFavorites);
  }, [
    querySearch,
    queryType,
    queryMap,
    querySpecialty,
    queryEnvironment,
    querySpecialFilter,
    queryFavoriteKeys,
    queryFavoriteMatchMode,
    queryIncludeUnknownFavorites,
  ]);

  const syncedParams = useMemo(
    () => ({
      q: search,
      type: selectedType,
      map: selectedMap,
      specialty: selectedSpecialty,
      environment: selectedEnvironment,
      special: specialFilter,
      favorite: selectedFavoriteKeys,
      favoriteMode: selectedFavoriteKeys.length > 0 && favoriteMatchMode !== 'all' ? favoriteMatchMode : undefined,
      includeUnknown: selectedFavoriteKeys.length > 0 && includeUnknownFavorites ? '1' : undefined,
    }),
    [
      favoriteMatchMode,
      includeUnknownFavorites,
      search,
      selectedEnvironment,
      selectedFavoriteKeys,
      selectedMap,
      selectedSpecialty,
      selectedType,
      specialFilter,
    ]
  );

  useSyncQueryParams(syncedParams);

  const favoriteEnvironments = useMemo(
    () =>
      Array.from(new Set(pokemon.map((entry) => entry.favoriteEnvironment).filter((entry): entry is string => Boolean(entry)))).sort(
        compareKo
      ),
    [pokemon]
  );

  const favoriteDataset = useMemo(() => {
    const labelByKey = new Map<string, string>();
    const countByKey = new Map<string, number>();
    const keysByPokemon = new Map<string, Set<string>>();

    for (const entry of pokemon) {
      const keys = new Set<string>();

      for (const label of getFavoriteLabels(entry)) {
        const key = normalizeFavoriteKey(label);
        if (!key) continue;
        keys.add(key);
        labelByKey.set(key, chooseFavoriteLabel(labelByKey.get(key), label));
      }

      keysByPokemon.set(entry.slug, keys);
      for (const key of keys) {
        countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
      }
    }

    const options: FavoriteOption[] = Array.from(countByKey.entries())
      .map(([key, count]) => ({
        key,
        label: labelByKey.get(key) ?? key,
        count,
      }))
      .sort((a, b) => b.count - a.count || compareKo(a.label, b.label));

    return { options, keysByPokemon, labelByKey };
  }, [pokemon]);

  const visibleFavoriteOptions = useMemo(() => {
    const query = favoriteSearch.trim().toLowerCase();
    if (!query) return favoriteDataset.options;
    return favoriteDataset.options.filter((option) => option.label.toLowerCase().includes(query));
  }, [favoriteDataset.options, favoriteSearch]);

  const filtered = useMemo(() => {
    let result = pokemon;

    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.name.toLowerCase().includes(query) ||
          entry.officialName.toLowerCase().includes(query) ||
          entry.nameEn.toLowerCase().includes(query) ||
          entry.nameJp.toLowerCase().includes(query) ||
          entry.number.includes(query)
      );
    }

    if (selectedType) {
      result = result.filter((entry) => entry.types.some((type) => type.nameKo === selectedType));
    }

    if (selectedMap) {
      result = result.filter((entry) => entry.primaryMap === selectedMap);
    }

    if (selectedEnvironment) {
      result = result.filter((entry) => entry.favoriteEnvironment === selectedEnvironment);
    }

    if (selectedSpecialty) {
      result = result.filter((entry) => entry.specialties.some((specialty) => specialty.nameKo === selectedSpecialty));
    }

    if (selectedFavoriteKeys.length > 0) {
      result = result.filter((entry) => {
        const favoriteKeys = favoriteDataset.keysByPokemon.get(entry.slug) ?? new Set<string>();

        if (favoriteKeys.size === 0) {
          return includeUnknownFavorites;
        }

        if (favoriteMatchMode === 'all') {
          return selectedFavoriteKeys.every((key) => favoriteKeys.has(key));
        }

        return selectedFavoriteKeys.some((key) => favoriteKeys.has(key));
      });
    }

    if (specialFilter === 'event') {
      result = result.filter((entry) => entry.isEvent);
    }

    if (specialFilter === 'variant') {
      result = result.filter((entry) => Boolean(entry.variantLabel) || entry.slotVariantNames.length > 0);
    }

    if (specialFilter === 'dream') {
      result = result.filter((entry) => entry.primaryMap === '꿈섬');
    }

    return result;
  }, [
    favoriteDataset.keysByPokemon,
    favoriteMatchMode,
    includeUnknownFavorites,
    pokemon,
    search,
    selectedEnvironment,
    selectedFavoriteKeys,
    selectedMap,
    selectedSpecialty,
    selectedType,
    specialFilter,
  ]);

  const hasFilter =
    search || selectedType || selectedMap || selectedEnvironment || selectedSpecialty || specialFilter || selectedFavoriteKeys.length > 0;

  const clearAll = () => {
    setSearch('');
    setSelectedType('');
    setSelectedMap('');
    setSelectedEnvironment('');
    setSelectedSpecialty('');
    setSpecialFilter('');
    setFavoriteSearch('');
    setSelectedFavoriteKeys([]);
    setFavoriteMatchMode('all');
    setIncludeUnknownFavorites(false);
  };

  const clearFavoriteFilter = () => {
    setFavoriteSearch('');
    setSelectedFavoriteKeys([]);
    setFavoriteMatchMode('all');
    setIncludeUnknownFavorites(false);
  };

  const toggleFavoriteKey = (key: string) => {
    setSelectedFavoriteKeys((current) => (current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]));
  };

  const selectClassName =
    'h-8 min-w-[96px] max-w-[148px] cursor-pointer appearance-none rounded-full border border-border bg-card pl-3 pr-7 text-[11px] font-semibold text-foreground transition-colors hover:border-pk-green';

  return (
    <div className="space-y-5">
      <input
        type="text"
        placeholder="이름, 영문명, 일본어명, 번호로 검색"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
      />

      <div className="flex flex-wrap gap-2">
        <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className={selectClassName}>
          <option value="">타입</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select value={selectedMap} onChange={(event) => setSelectedMap(event.target.value)} className={selectClassName}>
          <option value="">지역</option>
          {mapNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedEnvironment}
          onChange={(event) => setSelectedEnvironment(event.target.value)}
          className={selectClassName}
        >
          <option value="">환경</option>
          {favoriteEnvironments.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={selectedSpecialty}
          onChange={(event) => setSelectedSpecialty(event.target.value)}
          className={selectClassName}
        >
          <option value="">특기</option>
          {specialties.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select value={specialFilter} onChange={(event) => setSpecialFilter(event.target.value)} className={selectClassName}>
          <option value="">특수</option>
          <option value="event">이벤트</option>
          <option value="variant">폼/특수</option>
          <option value="dream">꿈섬 출신</option>
        </select>

        {hasFilter && (
          <button
            type="button"
            onClick={clearAll}
            className="h-8 rounded-full px-3 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/5"
          >
            초기화
          </button>
        )}
      </div>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFavoriteFilter((current) => !current)}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-pk-green"
          >
            좋아하는 것 필터 {selectedFavoriteKeys.length > 0 ? `(${selectedFavoriteKeys.length})` : ''}
          </button>

          <span className="text-[11px] text-muted-foreground">
            {favoriteMatchMode === 'all' ? '모두 포함' : '하나라도 포함'}
          </span>

          {selectedFavoriteKeys.length > 0 && (
            <button
              type="button"
              onClick={clearFavoriteFilter}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive/5"
            >
              좋아하는 것 초기화
            </button>
          )}
        </div>

        {selectedFavoriteKeys.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedFavoriteKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleFavoriteKey(key)}
                className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark"
              >
                {favoriteDataset.labelByKey.get(key) ?? key} x
              </button>
            ))}
          </div>
        )}

        {showFavoriteFilter && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <input
              type="text"
              value={favoriteSearch}
              onChange={(event) => setFavoriteSearch(event.target.value)}
              placeholder="좋아하는 것 검색"
              className="h-10 w-full rounded-2xl border border-border bg-background px-3 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
            />

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'any', label: '하나라도 포함' },
                { key: 'all', label: '모두 포함' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setFavoriteMatchMode(mode.key as FavoriteMatchMode)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    favoriteMatchMode === mode.key
                      ? 'bg-pk-green text-white'
                      : 'border border-border bg-background text-foreground hover:border-pk-green'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={includeUnknownFavorites}
                onChange={(event) => setIncludeUnknownFavorites(event.target.checked)}
                disabled={selectedFavoriteKeys.length === 0}
              />
              좋아하는 것 데이터가 비어있는 포켓몬도 포함
            </label>

            <div className="max-h-56 overflow-y-auto rounded-2xl border border-border bg-background p-2">
              <div className="flex flex-wrap gap-2">
                {visibleFavoriteOptions.map((option) => {
                  const selected = selectedFavoriteKeys.includes(option.key);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => toggleFavoriteKey(option.key)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        selected
                          ? 'bg-pk-green text-white'
                          : 'border border-border bg-card text-foreground hover:border-pk-green hover:text-pk-green-dark'
                      }`}
                    >
                      {option.label}
                      <span className={`mono ml-1 ${selected ? 'text-white/80' : 'text-muted-foreground'}`}>{option.count}</span>
                    </button>
                  );
                })}
              </div>
              {visibleFavoriteOptions.length === 0 && (
                <p className="px-2 py-5 text-center text-xs text-muted-foreground">해당하는 좋아하는 것이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        <span className="mono font-semibold text-foreground">{filtered.length}</span>
        {hasFilter ? ` / ${pokemon.length}` : ''}마리
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((entry) => (
          <PokemonCard key={entry.slug} pokemon={entry} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="space-y-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
          {favoriteMatchMode === 'all' && selectedFavoriteKeys.length > 1 && (
            <button
              type="button"
              onClick={() => setFavoriteMatchMode('any')}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-pk-green hover:text-pk-green-dark"
            >
              좋아하는 것 매칭을 `하나라도 포함`으로 바꾸기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
