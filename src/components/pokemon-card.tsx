'use client';

import Image from 'next/image';
import type { Pokemon } from '@/types/pokemon';
import { areaThemes } from '@/lib/constants';
import CollectionToggleButton from './collection-toggle-button';
import PreserveSearchLink from './preserve-search-link';
import TypeBadge from './type-badge';

export default function PokemonCard({ pokemon: entry }: { pokemon: Pokemon }) {
  const areaTheme = areaThemes[entry.primaryMap];
  const visibleSpecialties = entry.specialties.slice(0, 2);
  const primaryHabitatPrefix = entry.primaryHabitatNumber
    ? `No.${entry.primaryHabitatNumber} `
    : entry.primaryHabitatIsEvent
      ? '이벤트 서식지 '
      : '';

  return (
    <article className="pk-card h-full rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          {entry.isEvent && (
            <span className="rounded-full bg-pk-pink/15 px-2 py-0.5 text-[10px] font-bold text-pk-brown-dark">
              이벤트
            </span>
          )}
        </div>
        <CollectionToggleButton category="pokemon" itemId={entry.slug} compact />
      </div>

      <PreserveSearchLink href={`/pokemon/${entry.slug}`} className="block">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="mono text-[11px] text-muted-foreground">#{entry.number}</p>
            <h3 className="mt-1 text-sm font-bold leading-snug text-foreground">{entry.name}</h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{entry.nameEn}</p>
          </div>
        </div>

        <div className="mb-3 flex justify-center rounded-2xl bg-gradient-to-b from-white to-pk-green-light/25 py-3">
          {entry.imagePath ? (
            <Image src={entry.imagePath} alt={entry.name} width={84} height={84} className="object-contain" />
          ) : (
            <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-muted text-[11px] text-muted-foreground">
              이미지 없음
            </div>
          )}
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {entry.types.map((type) => (
            <TypeBadge key={type.nameJp} type={type.nameKo} />
          ))}
        </div>

        {visibleSpecialties.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {visibleSpecialties.map((specialty) => (
              <span
                key={specialty.nameJp}
                className="rounded-full bg-pk-green-light px-2 py-0.5 text-[11px] font-semibold text-pk-green-dark"
              >
                {specialty.nameKo}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1.5 border-t border-border pt-3">
          <p className="text-[11px] font-semibold" style={{ color: areaTheme?.color ?? '#8B6B4A' }}>
            {entry.primaryMap}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {entry.primaryHabitat ? `${primaryHabitatPrefix}${entry.primaryHabitat}` : '주 서식지 미상'}
          </p>
        </div>
      </PreserveSearchLink>
    </article>
  );
}
