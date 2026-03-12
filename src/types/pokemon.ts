export interface NamedLabel {
  nameJp: string;
  nameKo: string;
  translationStatus?: string;
}

export interface PokemonHabitat {
  id: string | null;
  number: string | null;
  ingameHabitatNo: number | null;
  isEvent: boolean;
  name: string;
  nameJp: string;
  imagePath: string | null;
  rarityStars: string;
  rarityLabel: string;
  rarityLevel: number;
  time: string[];
  weather: string[];
  requirementsJp: string[];
  requirementsKo: string[];
}

export interface Pokemon {
  id: number;
  slug: string;
  number: string;
  ingameDexNo: number;
  dexGroup: 'main' | 'event';
  sortIndex: number;
  sourceNationalDexNo: number;
  name: string;
  officialName: string;
  nameEn: string;
  nameJp: string;
  variantLabel: string | null;
  variantTranslationStatus: string | null;
  isEditorialVariant: boolean;
  isEvent: boolean;
  groupJp: string;
  imagePath: string | null;
  types: NamedLabel[];
  specialties: NamedLabel[];
  favoriteEnvironment: string | null;
  favoriteItems: string[];
  favoriteItemsNote: string | null;
  favoriteItemVariants: string[][];
  extraMaterials: string[];
  slotVariantNames: string[];
  primaryHabitat: string | null;
  primaryHabitatId: string | null;
  primaryHabitatNo: number | null;
  primaryHabitatNumber: string | null;
  primaryHabitatIsEvent: boolean;
  habitatNames: string[];
  primaryMap: string;
  primaryMapKey: string;
  primaryMapRecordLabel: string;
  habitats: PokemonHabitat[];
  taughtSkills: NamedLabel[];
  sourceGame8Url: string;
  sourcePokemonKoreaUrl: string;
}

export interface Habitat {
  id: string;
  name: string;
  nameJp: string | null;
  number: string | null;
  ingameHabitatNo: number | null;
  isEvent: boolean;
  imagePath: string | null;
  requirementsJp: string[];
  requirementsKo: string[];
  pokemonCount: number;
  primaryPokemonCount: number;
  pokemonEntries: Array<{ dexNo: number; number: string; slug: string; name: string }>;
  mapNames: string[];
}

export interface SpecialtyGroup {
  id: string;
  name: string;
  nameJp: string;
  translationStatus: string;
  pokemonIds: number[];
  pokemonCount: number;
}

export interface RecordFashionReward {
  category: string;
  categoryKey: string | null;
  name: string;
  imagePath: string | null;
}

export interface HumanRecord {
  id: number;
  type: string;
  orderInType: number;
  name: string;
  map: string;
  mapKey: string;
  locationDetail: string;
  hasDirectReward: boolean;
  directReward: string | null;
  directRewardType: string | null;
  hasFashionReward: boolean;
  fashionRewardCount: number;
  fashionRewards: RecordFashionReward[];
  sourceGame8Url: string;
}

export interface FashionItem {
  name: string;
  imagePath: string | null;
  unlockRecordIds: number[];
  unlockRecordNames: string[];
  maps: string[];
}

export interface FashionCategory {
  key: string;
  label: string;
  items: FashionItem[];
}

export interface MapSummary {
  key: string;
  name: string;
  recordName: string;
  pokemonCount: number;
  recordCount: number;
  habitatCount: number;
}

export interface SiteStats {
  pokemonCount: number;
  eventPokemonCount: number;
  habitatCount: number;
  recordCount: number;
  fashionItemCount: number;
  specialtyCount: number;
  imageCount: number;
}

export interface SiteData {
  generatedAt: string;
  sourceRoot: string;
  stats: SiteStats;
  maps: MapSummary[];
  pokemon: Pokemon[];
  habitats: Habitat[];
  specialties: SpecialtyGroup[];
  records: HumanRecord[];
  fashionCategories: FashionCategory[];
}
