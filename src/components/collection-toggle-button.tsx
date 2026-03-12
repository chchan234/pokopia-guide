'use client';

import OwnedToggle from '@/components/owned-toggle';
import { useCollection } from '@/components/collection-provider';

export default function CollectionToggleButton({
  category,
  itemId,
  compact = false,
}: {
  category: 'pokemon' | 'habitats' | 'records' | 'fashion';
  itemId: string | number;
  compact?: boolean;
}) {
  const { pokemonOwnedSet, habitatOwnedSet, recordOwnedSet, fashionOwnedSet, togglePokemon, toggleHabitat, toggleRecord, toggleFashion } =
    useCollection();

  const owned =
    category === 'pokemon'
      ? pokemonOwnedSet.has(itemId as string)
      : category === 'habitats'
        ? habitatOwnedSet.has(itemId as string)
        : category === 'records'
          ? recordOwnedSet.has(itemId as number)
          : fashionOwnedSet.has(itemId as string);

  function handleToggle() {
    if (category === 'pokemon') {
      togglePokemon(itemId as string);
      return;
    }

    if (category === 'habitats') {
      toggleHabitat(itemId as string);
      return;
    }

    if (category === 'records') {
      toggleRecord(itemId as number);
      return;
    }

    toggleFashion(itemId as string);
  }

  return <OwnedToggle owned={owned} onToggle={handleToggle} compact={compact} />;
}
