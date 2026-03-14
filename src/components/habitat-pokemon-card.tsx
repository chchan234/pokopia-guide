'use client';

import { useCollection } from '@/components/collection-provider';

interface HabitatPokemonCardProps {
  slug: string;
  children: React.ReactNode;
}

export default function HabitatPokemonCard({ slug, children }: HabitatPokemonCardProps) {
  const { hydrated, pokemonOwnedSet } = useCollection();
  const owned = hydrated && pokemonOwnedSet.has(slug);

  return (
    <div className="relative">
      {children}
      {owned && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-foreground/5">
          <span className="rounded-full bg-pk-green/90 px-3 py-1 text-[11px] font-bold text-white">보유</span>
        </div>
      )}
    </div>
  );
}
