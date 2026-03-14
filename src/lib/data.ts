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

// 아이템 한국어 이름 → imagePath 룩업 (서식지 재료 등에서 사용)
const _itemImageMap = new Map<string, string>();
for (const item of itemsData.allItems) {
  if (item.imagePath) {
    if (item.nameKo) _itemImageMap.set(item.nameKo, item.imagePath);
    _itemImageMap.set(item.nameJp, item.imagePath);
  }
}

// allItems에 없는 서식지 재료 이미지 보충
const _GW = 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha';
const _supplementaryImages: Record<string, string> = {
  '가로등': `${_GW}/item_36.png`,
  '개구리밥': `${_GW}/item_125.png`,
  '꽃무늬 배낭': `${_GW}/item_636.png`,
  '꽃무늬 식기 세트': `${_GW}/item_629.png`,
  '꽃무늬 쿠션': `${_GW}/item_631.png`,
  '노란 풀': `${_GW}/item_110.png`,
  '도시락': `${_GW}/item_634.png`,
  '들판의 꽃': `${_GW}/item_15.png`,
  '바위 지대의 꽃': `${_GW}/item_123.png`,
  '분홍 풀': `${_GW}/item_403.png`,
  '빨간 풀': `${_GW}/item_121.png`,
  '세모난 나무': `${_GW}/item_122.png`,
  '이끼': `${_GW}/item_126.png`,
  '이끼 바위': `${_GW}/item_127.png`,
  '저주받은 갑옷': `${_GW}/item_300.png`,
  '초록 풀': `${_GW}/item_6.png`,
  '축복받은 갑옷': `${_GW}/item_299.png`,
  '큰 야자나무': `${_GW}/item_112.png`,
  '큰돌': `${_GW}/item_97.png`,
  '통통코 물통': `${_GW}/item_633.png`,
  '평온한 꽃': `${_GW}/item_628.png`,
  '프라이팬': `${_GW}/item_156.png`,
  '해변의 꽃': `${_GW}/item_111.png`,
  '화장대': `${_GW}/item_495.png`,
  '부유섬의 꽃': `${_GW}/item_396.png`,
  // 제네릭 카테고리 — 대표 아이템 이미지 사용
  '풀': `${_GW}/item_6.png`,
  '수풀': `${_GW}/item_6.png`,
  '큰나무': `${_GW}/item_112.png`,
  '조명': `${_GW}/item_36.png`,
  '장난감': `${_GW}/item_19.png`,
  '칸막이': `${_GW}/item_84.png`,
  '파티션': `${_GW}/item_84.png`,
  '화분나무': `${_GW}/item_112.png`,
  '채소밭': `${_GW}/item_15.png`,
  '그루터기': `${_GW}/item_97.png`,
  '나무열매 나무': `${_GW}/item_15.png`,
  // (아무거나)/(큰 것) 제네릭 카테고리 — 대표 아이템 이미지 사용
  '의자': `${_GW}/item_101.png`,     // 건초 걸상
  '침대': `${_GW}/item_11.png`,      // 건초 침대
  '테이블': `${_GW}/item_49.png`,    // 건초테이블
  '인형': `${_GW}/item_54.png`,      // 이브이 인형
  '옷장': `${_GW}/item_472.png`,     // 앤티크 옷장
  '받침대': `${_GW}/item_139.png`,   // 스테이지 받침대
  '나무 길': `${_GW}/item_64.png`,
  '접시에 올린 음식': `${_GW}/item_325.png`, // 접시 레시피 이미지
  '신문': `${_GW}/item_156.png`,     // 잡화 대표
  '떨어진 물건': `${_GW}/item_97.png`, // 큰돌 대표
  // 환경 조건 태그 — 대표 아이템 이미지 사용
  '물': `${_GW}/item_309.png`,        // 물통
  '바닷물': `${_GW}/item_27.png`,     // 쏘드라 분수
  '폭포': `${_GW}/item_27.png`,       // 분수 대표
  '높은곳': `${_GW}/item_97.png`,     // 큰돌 대표
};
for (const [name, url] of Object.entries(_supplementaryImages)) {
  if (!_itemImageMap.has(name)) _itemImageMap.set(name, url);
}

export function getItemImage(name: string): string | null {
  // "건초테이블 ×1" → "건초테이블"
  const clean = name.replace(/\s*[×x]\s*\d+$/i, '').trim();
  // 정확한 매칭
  if (_itemImageMap.has(clean)) return _itemImageMap.get(clean)!;
  // "(아무거나)" 제거 후 재시도: "의자(아무거나)" → "의자"
  const withoutAny = clean.replace(/\(아무거나\)$/, '').replace(/\(큰 것\)$/, '').replace(/\(긴 것\)$/, '').trim();
  if (withoutAny !== clean && _itemImageMap.has(withoutAny)) return _itemImageMap.get(withoutAny)!;
  return null;
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
