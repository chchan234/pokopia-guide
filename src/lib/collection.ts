export type CollectionCategoryKey = 'pokemon' | 'habitats' | 'records' | 'fashion';

export type OwnershipFilter = 'all' | 'owned' | 'missing';

export interface CollectionState {
  pokemon: string[];
  habitats: string[];
  records: number[];
  fashion: string[];
}

export const collectionStorageKey = 'pokopia-guide:collection:v1';

export const defaultCollectionState: CollectionState = {
  pokemon: [],
  habitats: [],
  records: [],
  fashion: [],
};

export function getFashionCollectionId(categoryKey: string, itemName: string) {
  return `${categoryKey}::${itemName}`;
}

export function matchesOwnershipFilter(isOwned: boolean, filter: OwnershipFilter) {
  if (filter === 'owned') {
    return isOwned;
  }

  if (filter === 'missing') {
    return !isOwned;
  }

  return true;
}
