'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';

interface SpecialtyPokemon {
  slug: string;
  number: string;
  name: string;
  officialName: string;
  nameEn: string;
  nameJp: string;
}

interface SpecialtyGroupWithPokemon {
  id: string;
  name: string;
  nameJp: string;
  pokemon: SpecialtyPokemon[];
}

interface FilteredSpecialtyGroup {
  id: string;
  name: string;
  nameJp: string;
  pokemon: SpecialtyPokemon[];
  visiblePokemon: SpecialtyPokemon[];
}

export default function SpecialtiesFilter({ groups }: { groups: SpecialtyGroupWithPokemon[] }) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const filteredGroups = useMemo((): FilteredSpecialtyGroup[] => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return groups.map((group) => ({
        ...group,
        visiblePokemon: group.pokemon,
      }));
    }

    return groups
      .map((group) => {
        const visiblePokemon = group.pokemon.filter(
          (entry) =>
            entry.name.toLowerCase().includes(query) ||
            entry.officialName.toLowerCase().includes(query) ||
            entry.nameEn.toLowerCase().includes(query) ||
            entry.nameJp.toLowerCase().includes(query) ||
            entry.number.includes(query)
        );

        return {
          ...group,
          visiblePokemon,
        };
      })
      .filter((group) => group.visiblePokemon.length > 0);
  }, [groups, search]);

  return (
    <div className="space-y-8">
      <input
        type="text"
        placeholder="포켓몬 이름, 영문명, 일본어명, 번호로 검색"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-card px-4 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20"
      />

      <div className="flex flex-wrap gap-2">
        {filteredGroups.map((specialty) => (
          <a
            key={specialty.id}
            href={`#${specialty.id}`}
            className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:border-pk-green hover:bg-pk-green-light sm:text-xs"
          >
            {specialty.name}
            <span className="mono ml-1 text-muted-foreground">{search ? specialty.visiblePokemon.length : specialty.pokemon.length}</span>
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {filteredGroups.map((specialty) => (
          <section key={specialty.id} id={specialty.id} className="scroll-mt-20 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="border-b border-border bg-pk-green-light/30 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">{specialty.name}</h2>
                  <p className="text-sm text-muted-foreground sm:text-xs">{specialty.nameJp}</p>
                </div>
                <span className="mono text-lg font-bold text-pk-green">
                  {search ? `${specialty.visiblePokemon.length}/${specialty.pokemon.length}` : specialty.pokemon.length}
                </span>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                {specialty.visiblePokemon.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/pokemon/${entry.slug}`}
                    className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark sm:text-xs"
                  >
                    #{entry.number} {entry.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">검색 조건에 맞는 포켓몬이 없습니다.</div>
      )}
    </div>
  );
}
