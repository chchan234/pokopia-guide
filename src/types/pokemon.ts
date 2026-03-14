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

export interface DreamIsland {
  id: string;
  nameJp: string;
  nameKo: string | null;
  sourceUrl: string;
  requiredDollJp: string;
  requiredDollKo: string | null;
  requiredDollNoteJp: string;
  requiredDollNoteKo: string;
  legendaryJp: string | null;
  legendaryKo: string | null;
  findingsJp: string[];
  findingsKo: string[];
  notesKo: string[];
}

export interface DreamDoll {
  id: string;
  nameJp: string;
  nameKo: string | null;
  mapJp: string;
  mapKo: string;
  dreamIslandJp: string;
  dreamIslandKo: string;
  noteJp: string;
  noteKo: string;
  imagePath: string | null;
  sourceUrl: string;
}

export interface DreamDataSummary {
  recordCount: number;
  directRewardCount: number;
  fashionRewardCount: number;
  directRewardTypes: Record<string, number>;
  notesKo: string[];
}

export interface DreamData {
  sourceUrls: string[];
  summary: DreamDataSummary;
  islands: DreamIsland[];
  dolls: DreamDoll[];
  notesKo: string[];
}

export interface CookingToolCard {
  toolJp: string;
  toolKo: string;
  mainIngredientJp: string;
  mainIngredientKo: string;
  dishTypeJp: string;
  dishTypeKo: string;
}

export interface CookingCategoryEffect {
  categoryJp: string;
  categoryKo: string;
  skillJp: string;
  skillKo: string | null;
  effectKo: string;
}

export interface CookingRecommendation {
  nameJp: string;
  nameKo: string | null;
  reasonKo: string;
}

export interface Dish {
  id: string;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  categoryJp: string;
  categoryKo: string | null;
  tasteJp: string;
  tasteKo: string | null;
  materialsJp: string[];
  materialsKo: string[];
  helperSpecialtyJp: string | null;
  helperSpecialtyKo: string | null;
  toolJp: string;
  toolKo: string | null;
  boostedSkillJp: string;
  boostedSkillKo: string | null;
  boostSummaryJp: string;
  offeringEffectJp: string;
  offeringEffectKo: string;
  sourceUrl: string;
}

export interface CookingDataSummary {
  dishCount: number;
  toolCount: number;
  categoryCount: number;
  notesKo: string[];
}

export interface OfferingGrade {
  labelKo: string;
  labelJp: string;
  descriptionKo: string;
}

export interface TasteEffect {
  tasteKo: string;
  tasteJp: string;
  effectKo: string;
  topDishKo: string;
}

export interface OfferingSystem {
  descriptionKo: string;
  unlockKo: string;
  durationKo: string;
  grades: OfferingGrade[];
  tasteEffects: TasteEffect[];
}

export interface CookingData {
  sourceUrls: string[];
  summary: CookingDataSummary;
  offeringSystem: OfferingSystem;
  toolCards: CookingToolCard[];
  categoryEffects: CookingCategoryEffect[];
  recommended: CookingRecommendation[];
  dishes: Dish[];
}

export interface RecipeEntry {
  id: string;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  sourceType: 'shop' | 'other';
  sourceJp: string;
  sourceKo: string;
  price: number | null;
  sourceUrl: string;
}

export interface AllItemEntry {
  id: string;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  categoryJp: string;
  categoryKo: string | null;
  useJp: string;
  useKo: string;
  usageTargetsJp: string[];
  usageTargetsKo: string[];
  craftMaterialsJp: string[];
  craftMaterialsKo: string[];
  sourceUrl: string;
}

export interface BuildingEntry {
  id: string;
  nameJp: string;
  nameKo: string | null;
  typeJp: string;
  typeKo: string;
  sourceUrl: string;
  imagePath: string | null;
  capacity: string | null;
  buildTime: string | null;
  useJp: string | null;
  useKo: string | null;
  recipeJp: string | null;
  recipeKo: string | null;
  requiredSpecialtiesJp: string[];
  requiredSpecialtiesKo: string[];
  requiredMaterialsJp: string[];
  requiredMaterialsKo: string[];
  descriptionJp?: string;
  descriptionKo?: string;
}

export interface ItemDoll {
  id: string;
  nameJp: string;
  nameKo: string | null;
  mapJp: string;
  mapKo: string;
  dreamIslandJp: string;
  dreamIslandKo: string;
  noteJp: string;
  noteKo: string;
  imagePath: string | null;
  sourceUrl: string;
}

export interface CDEntry {
  id: string;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  obtainJp: string;
  obtainKo: string;
  useKo: string;
  sourceUrl: string;
}

export interface BerryEntry {
  id: string;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  obtainJp: string;
  obtainKo: string;
  notesKo: string[];
  sourceUrl: string;
}

export interface EmoteEntry {
  id: string;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  obtainJp: string;
  obtainKo: string;
  sourceUrl: string;
}

export interface BestshotEntry {
  id: string;
  number: number;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  conditionJp: string;
  conditionKo: string;
  rewardJp: string;
  rewardKo: string;
  sourceUrl: string;
}

export interface SpecialCollectionEntry {
  id: string;
  nameJp: string;
  nameKo: string;
  imagePath: string | null;
  summaryKo: string;
  sourceUrl: string;
}

export interface AncientItemEntry {
  number?: number;
  nameJp: string;
  nameKo: string | null;
  imagePath: string | null;
  mapJp?: string;
  mapKo?: string;
}

export interface AncientItemGroup {
  id: string;
  nameJp: string;
  nameKo: string;
  count: number;
  items: AncientItemEntry[];
}

export interface ItemsDataSummary {
  itemCount: number;
  recipeCount: number;
  shopRecipeCount: number;
  otherRecipeCount: number;
  buildingCount: number;
  dollCount: number;
  cdCount: number;
  berryCount: number;
  emoteCount: number;
  bestshotCount: number;
  ancientItemCount: number;
  notesKo: string[];
}

export interface ItemsData {
  sourceUrls: string[];
  summary: ItemsDataSummary;
  allItems: AllItemEntry[];
  recipes: {
    shop: RecipeEntry[];
    other: RecipeEntry[];
  };
  buildings: BuildingEntry[];
  dolls: ItemDoll[];
  cds: CDEntry[];
  berries: BerryEntry[];
  emotes: EmoteEntry[];
  bestshots: BestshotEntry[];
  specialCollections: SpecialCollectionEntry[];
  ancientItemGroups: AncientItemGroup[];
}

export interface MaterialUsageEntry {
  category: 'cooking' | 'habitat' | 'building' | 'craft';
  categoryLabel: string;
  name: string;
  detail: string;
  href: string | null;
  imagePath: string | null;
}

export interface MaterialUsage {
  material: string;
  usages: MaterialUsageEntry[];
}

export interface GlobalSearchEntry {
  id: string;
  categoryKey: string;
  categoryLabel: string;
  title: string;
  subtitle: string;
  href: string;
  imagePath: string | null;
  searchText: string;
}
