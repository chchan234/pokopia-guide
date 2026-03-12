'use client';

import { useMemo, useState } from 'react';
import type { Pokemon } from '@/types/pokemon';
import PokemonCard from './pokemon-card';

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
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMap, setSelectedMap] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialFilter, setSpecialFilter] = useState('');

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

    if (selectedSpecialty) {
      result = result.filter((entry) => entry.specialties.some((specialty) => specialty.nameKo === selectedSpecialty));
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
  }, [pokemon, search, selectedMap, selectedSpecialty, selectedType, specialFilter]);

  const hasFilter = search || selectedType || selectedMap || selectedSpecialty || specialFilter;

  const clearAll = () => {
    setSearch('');
    setSelectedType('');
    setSelectedMap('');
    setSelectedSpecialty('');
    setSpecialFilter('');
  };

  const selectClassName =
    'h-8 w-[96px] cursor-pointer appearance-none rounded-full border border-border bg-card pl-3 pr-7 text-[11px] font-semibold text-foreground transition-colors hover:border-pk-green';

  return (
    <div className="space-y-5">
      <input
        type="text"
        placeholder="이름, 영문명, 일본어명, 번호로 검색"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
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

      <p className="text-xs text-muted-foreground">
        <span className="mono font-semibold text-foreground">{filtered.length}</span>
        {hasFilter ? ` / ${pokemon.length}` : ''}마리
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((entry) => (
          <PokemonCard key={entry.slug} pokemon={entry} />
        ))}
      </div>

      {filtered.length === 0 && <div className="py-20 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</div>}
    </div>
  );
}
