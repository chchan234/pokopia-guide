export type CollectionCategoryKey = 'pokemon' | 'habitats' | 'records' | 'fashion' | 'bestshots' | 'recipes';

export type OwnershipFilter = 'all' | 'owned' | 'missing';

export interface CollectionState {
  pokemon: string[];
  habitats: string[];
  records: number[];
  fashion: string[];
  bestshots: string[];
  recipes: string[];
}

export const collectionStorageKey = 'pokopia-guide:collection:v1';

export const defaultCollectionState: CollectionState = {
  pokemon: [],
  habitats: [],
  records: [],
  fashion: [],
  bestshots: [],
  recipes: [],
};

export function getFashionCollectionId(categoryKey: string, itemName: string) {
  return `${categoryKey}::${itemName}`;
}

export function isOwnershipFilter(value: string | null): value is OwnershipFilter {
  return value !== null && ['all', 'owned', 'missing'].includes(value);
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
