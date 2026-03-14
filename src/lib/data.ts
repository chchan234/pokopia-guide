import 'server-only';
import siteData from '@/data/site-data.json';
import cookingDataJson from '@/data/cooking-data.json';
import dreamDataJson from '@/data/dream-data.json';
import itemsDataJson from '@/data/items-data.json';
import type {
  CookingData,
  DreamData,
  FashionCategory,
  GlobalSearchEntry,
  Habitat,
  HumanRecord,
  ItemsData,
  MapSummary,
  Pokemon,
  SiteData,
  SpecialtyGroup,
} from '@/types/pokemon';

const data = siteData as SiteData;
const dreamData = dreamDataJson as DreamData;
const cookingData = cookingDataJson as CookingData;
const itemsData = itemsDataJson as ItemsData;

export const stats = data.stats;
export const maps = data.maps as MapSummary[];
export const pokemon = data.pokemon as Pokemon[];
export const habitats = data.habitats as Habitat[];
export const specialties = data.specialties as SpecialtyGroup[];
export const humanRecords = data.records as HumanRecord[];
export const fashionCategories = data.fashionCategories as FashionCategory[];
export const dreamIslandsData = dreamData;
export const cookingGuideData = cookingData;
export const itemsGuideData = itemsData;

export function getPokemonBySlug(slug: string): Pokemon | undefined {
  return pokemon.find((entry) => entry.slug === slug);
}

export function getHabitatById(id: string): Habitat | undefined {
  return habitats.find((entry) => entry.id === id);
}

export function getRecordById(id: number): HumanRecord | undefined {
  return humanRecords.find((entry) => entry.id === id);
}

export function getPokemonByHabitat(name: string): Pokemon[] {
  return pokemon.filter((entry) => entry.habitatNames.includes(name));
}

export function getPokemonBySpecialty(name: string): Pokemon[] {
  return pokemon.filter((entry) => entry.specialties.some((specialty) => specialty.nameKo === name));
}

export const allTypes = Array.from(
  new Set(pokemon.flatMap((entry) => entry.types.map((type) => type.nameKo)))
).sort((a, b) => a.localeCompare(b, 'ko'));

export const allSpecialties = Array.from(
  new Set(pokemon.flatMap((entry) => entry.specialties.map((specialty) => specialty.nameKo)))
).sort((a, b) => a.localeCompare(b, 'ko'));

export const allMapNames = Array.from(new Set(pokemon.map((entry) => entry.primaryMap))).sort((a, b) => a.localeCompare(b, 'ko'));

function buildSearchText(values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();
}

export const globalSearchEntries: GlobalSearchEntry[] = [
  ...pokemon.map((entry) => ({
    id: `pokemon-${entry.slug}`,
    categoryKey: 'pokemon',
    categoryLabel: '포켓몬',
    title: `#${entry.number} ${entry.name}`,
    subtitle: [entry.primaryMap, entry.primaryHabitat].filter(Boolean).join(' · ') || '주 서식지 미상',
    href: `/pokemon/${entry.slug}`,
    imagePath: entry.imagePath,
    searchText: buildSearchText([
      entry.name,
      entry.officialName,
      entry.nameEn,
      entry.nameJp,
      entry.number,
      entry.primaryMap,
      entry.primaryHabitat,
      entry.favoriteEnvironment,
      ...entry.favoriteItems,
      ...entry.specialties.map((specialty) => specialty.nameKo),
      ...entry.specialties.map((specialty) => specialty.nameJp),
    ]),
  })),
  ...habitats.map((entry) => ({
    id: `habitat-${entry.id}`,
    categoryKey: 'habitats',
    categoryLabel: '서식지',
    title: `${entry.number ? `No.${entry.number} ` : entry.isEvent ? '이벤트 서식지 ' : ''}${entry.name}`,
    subtitle: [entry.mapNames.join(' · ') || '미상', `연결 포켓몬 ${entry.pokemonCount}마리`].join(' · '),
    href: `/habitats/${entry.id}`,
    imagePath: entry.imagePath,
    searchText: buildSearchText([
      entry.name,
      entry.nameJp,
      entry.number,
      ...entry.mapNames,
      ...entry.requirementsKo,
      ...entry.requirementsJp,
      ...entry.pokemonEntries.map((pokemonEntry) => pokemonEntry.name),
      ...entry.pokemonEntries.map((pokemonEntry) => pokemonEntry.number),
    ]),
  })),
  ...specialties.map((entry) => {
    const relatedPokemon = pokemon.filter((pokemonEntry) => pokemonEntry.specialties.some((specialty) => specialty.nameKo === entry.name));
    return {
      id: `specialty-${entry.id}`,
      categoryKey: 'specialties',
      categoryLabel: '특기',
      title: entry.name,
      subtitle: `포켓몬 ${entry.pokemonCount}마리`,
      href: `/specialties?q=${encodeURIComponent(entry.name)}`,
      imagePath: relatedPokemon[0]?.imagePath ?? null,
      searchText: buildSearchText([
        entry.name,
        entry.nameJp,
        ...relatedPokemon.map((pokemonEntry) => pokemonEntry.name),
        ...relatedPokemon.map((pokemonEntry) => pokemonEntry.nameJp),
        ...relatedPokemon.map((pokemonEntry) => pokemonEntry.number),
      ]),
    };
  }),
  ...humanRecords.map((entry) => ({
    id: `record-${entry.id}`,
    categoryKey: 'records',
    categoryLabel: '기록',
    title: entry.name,
    subtitle: [entry.map, entry.directReward ?? entry.locationDetail].join(' · '),
    href: `/records/${entry.id}`,
    imagePath: entry.fashionRewards[0]?.imagePath ?? null,
    searchText: buildSearchText([
      entry.name,
      entry.map,
      entry.type,
      entry.locationDetail,
      entry.directReward,
      entry.directRewardType,
      ...entry.fashionRewards.map((reward) => reward.name),
    ]),
  })),
  ...fashionCategories.flatMap((category) =>
    category.items.map((item) => ({
      id: `fashion-${category.key}-${item.name}`,
      categoryKey: 'fashion',
      categoryLabel: '의상',
      title: item.name,
      subtitle: [category.label, item.unlockRecordNames[0] ?? '기록 연결 없음'].join(' · '),
      href: `/fashion?q=${encodeURIComponent(item.name)}`,
      imagePath: item.imagePath,
      searchText: buildSearchText([item.name, category.label, ...item.unlockRecordNames, ...item.maps]),
    }))
  ),
  ...dreamData.islands.map((entry) => ({
    id: `dream-island-${entry.id}`,
    categoryKey: 'dream',
    categoryLabel: '꿈섬',
    title: entry.nameKo || entry.nameJp,
    subtitle: entry.requiredDollKo || entry.requiredDollJp,
    href: `/dream-islands?q=${encodeURIComponent(entry.nameKo || entry.nameJp)}`,
    imagePath: null,
    searchText: buildSearchText([
      entry.nameKo,
      entry.nameJp,
      entry.requiredDollKo,
      entry.requiredDollJp,
      entry.legendaryKo,
      entry.legendaryJp,
      ...entry.findingsKo,
      ...entry.findingsJp,
      ...entry.notesKo,
    ]),
  })),
  ...dreamData.dolls.map((entry) => ({
    id: `dream-doll-${entry.id}`,
    categoryKey: 'dream',
    categoryLabel: '꿈섬',
    title: entry.nameKo || entry.nameJp,
    subtitle: [entry.dreamIslandKo, entry.mapKo].filter(Boolean).join(' · '),
    href: `/dream-islands?q=${encodeURIComponent(entry.nameKo || entry.nameJp)}`,
    imagePath: entry.imagePath,
    searchText: buildSearchText([
      entry.nameKo,
      entry.nameJp,
      entry.dreamIslandKo,
      entry.dreamIslandJp,
      entry.mapKo,
      entry.mapJp,
      entry.noteKo,
      entry.noteJp,
    ]),
  })),
  ...cookingData.dishes.map((entry) => ({
    id: `cooking-${entry.id}`,
    categoryKey: 'cooking',
    categoryLabel: '요리',
    title: entry.nameKo || entry.nameJp,
    subtitle: [entry.toolKo || entry.toolJp, entry.offeringEffectKo].filter(Boolean).join(' · '),
    href: `/cooking?q=${encodeURIComponent(entry.nameKo || entry.nameJp)}`,
    imagePath: entry.imagePath,
    searchText: buildSearchText([
      entry.nameKo,
      entry.nameJp,
      entry.categoryKo,
      entry.categoryJp,
      entry.tasteKo,
      entry.tasteJp,
      entry.toolKo,
      entry.toolJp,
      entry.boostedSkillKo,
      entry.boostedSkillJp,
      entry.helperSpecialtyKo,
      entry.helperSpecialtyJp,
      entry.offeringEffectKo,
      ...entry.materialsKo,
      ...entry.materialsJp,
    ]),
  })),
  ...itemsData.allItems.map((entry) => ({
    id: `item-${entry.id}`,
    categoryKey: 'items',
    categoryLabel: '아이템',
    title: entry.nameKo || entry.nameJp,
    subtitle: [entry.categoryKo || entry.categoryJp, entry.useKo].filter(Boolean).join(' · '),
    href: `/items?tab=allitems&q=${encodeURIComponent(entry.nameKo || entry.nameJp)}`,
    imagePath: entry.imagePath,
    searchText: buildSearchText([
      entry.nameKo,
      entry.nameJp,
      entry.categoryKo,
      entry.categoryJp,
      entry.useKo,
      entry.useJp,
      ...entry.usageTargetsKo,
      ...entry.usageTargetsJp,
    ]),
  })),
  ...itemsData.recipes.shop.map((entry) => ({
    id: `recipe-${entry.id}`,
    categoryKey: 'items',
    categoryLabel: '레시피',
    title: entry.nameKo || entry.nameJp,
    subtitle: ['상점', entry.sourceKo].join(' · '),
    href: `/items?tab=recipes&q=${encodeURIComponent(entry.nameKo || entry.nameJp)}`,
    imagePath: entry.imagePath,
    searchText: buildSearchText([entry.nameKo, entry.nameJp, entry.sourceKo, entry.sourceJp, entry.price ? String(entry.price) : null]),
  })),
  ...itemsData.recipes.other.map((entry) => ({
    id: `recipe-${entry.id}`,
    categoryKey: 'items',
    categoryLabel: '레시피',
    title: entry.nameKo || entry.nameJp,
    subtitle: ['기타', entry.sourceKo].join(' · '),
    href: `/items?tab=recipes&q=${encodeURIComponent(entry.nameKo || entry.nameJp)}`,
    imagePath: entry.imagePath,
    searchText: buildSearchText([entry.nameKo, entry.nameJp, entry.sourceKo, entry.sourceJp]),
  })),
];
