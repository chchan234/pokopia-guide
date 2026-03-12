import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const APP_ROOT = process.cwd();
const SOURCE_ROOT = process.env.POKOPIA_SOURCE_DIR ?? path.resolve(APP_ROOT, '..', '..', '..', 'pokopia-guide');
const SOURCE_DATA_DIR = path.join(SOURCE_ROOT, 'data');
const OUTPUT_FILE = path.join(APP_ROOT, 'src', 'data', 'site-data.json');
const INGAME_REFERENCE_FILE = 'pokopia_ingame_pokedex_reference.json';
const HABITAT_MATERIAL_MAP_FILE = 'pokopia_habitat_material_manual_map_ko.csv';
const HABITAT_MATERIAL_EDITORIAL_MAP_FILE = 'pokopia_habitat_material_editorial_map_ko.json';
const HABITAT_NUMBER_REFERENCE_FILE = 'pokopia_ingame_habitat_number_reference_game8.csv';
const EVENT_HABITAT_NAME_JP_SET = new Set(['黄色のじゅうたん', 'タンポポとお昼ご飯', '遠足のおとも']);
const HABITAT_NAME_KO_TO_JP_ALIASES = {
  '작은 도서관': 'プチ図書館',
};

const TYPE_LABELS = {
  'あく': '악',
  'いわ': '바위',
  'かくとう': '격투',
  'くさ': '풀',
  'こおり': '얼음',
  'じめん': '땅',
  'でんき': '전기',
  'どく': '독',
  'はがね': '강철',
  'ひこう': '비행',
  'ほのお': '불꽃',
  'みず': '물',
  'むし': '벌레',
  'エスパー': '에스퍼',
  'ゴースト': '고스트',
  'ドラゴン': '드래곤',
  'ノーマル': '노말',
  'フェアリー': '페어리',
};

const SPECIALTY_LABELS = {
  DJ: 'DJ',
  'あくび': '하품',
  'うるおす': '급수',
  'かんてい': '감정',
  'きをきる': '절삭',
  'くいしんぼ': '먹보',
  'けんちく': '건축',
  'さいばい': '재배',
  'さがしもの': '탐색',
  'しゅうのう': '수납',
  'しょくにん': '장인',
  'しわける': '분류',
  'じならし': '땅고르기',
  'そらをとぶ': '공중날기',
  'ちらかす': '어지르기',
  'つぶす': '분쇄',
  'とりひき': '거래',
  'はっこう': '발광',
  'はつでん': '발전',
  'ばくはつ': '폭발',
  'へんしん': '변신',
  'もやす': '점화',
  'もりあげる': '분위기 메이킹',
  'ゆめしま': '꿈섬',
  'コレクター': '컬렉터',
  'テレポート': '순간이동',
  'パーティー': '파티',
  'ペイント': '페인팅',
  'ミツあつめ': '꿀 모으기',
  'リサイクル': '리사이클',
  'レアもの': '레어 수집',
};

const SPECIALTY_KO_TO_JP = Object.fromEntries(
  Object.entries(SPECIALTY_LABELS).map(([nameJp, nameKo]) => [nameKo, nameJp])
);

const SKILL_LABELS = {
  'いあいぎり': '풀베기',
  'いわくだき': '바위깨기',
  'かいりき': '괴력',
  'かっくう': '활공',
  'このは': '나뭇잎',
  'ころがる': '구르기',
  'たがやす': '갈아엎기',
  'たきのぼり': '폭포오르기',
  'ちょすい': '저수',
  'でんじふゆう': '전자부유',
  'なみのり': '파도타기',
  'はねる': '튀어오르기',
  'みずでっぽう': '물대포',
  'モノまね': '흉내내기',
};

const HABITAT_RARITY_LABELS = {
  'ふつう': '기본',
  'めずらしい': '희귀',
  'とてもめずらしい': '매우 희귀',
};

const TIME_LABELS = {
  '朝': '아침',
  '昼': '낮',
  '夕': '저녁',
  '夜': '밤',
};

const WEATHER_LABELS = {
  '晴れ': '맑음',
  '曇り': '흐림',
  '雨': '비',
};

const PRIMARY_MAPS = {
  'パサパサこうや': { key: 'wasteland', name: '메마른 황야', recordName: '메마른 황야 마을' },
  'ドンヨリうみべ': { key: 'beach', name: '우중충한 해변', recordName: '우중충한 해변 마을' },
  'ゴツゴツやま': { key: 'mountain', name: '울퉁불퉁 산', recordName: '울퉁불퉁 산마을' },
  'キラキラうきしま': { key: 'sky-island', name: '반짝반짝 부유섬', recordName: '반짝반짝 부유섬 마을' },
  'まっさらな街': { key: 'blank-town', name: '빈 마을', recordName: '빈 마을' },
  'ゆめしま': { key: 'dream-island', name: '꿈섬', recordName: '꿈섬' },
  'ー': { key: 'unknown', name: '미상', recordName: '미상' },
};

const RECORD_MAP_KEYS = {
  '메마른 황야 마을': 'wasteland',
  '우중충한 해변 마을': 'beach',
  '울퉁불퉁 산마을': 'mountain',
  '반짝반짝 부유섬 마을': 'sky-island',
  '꿈섬': 'dream-island',
  '빈 마을': 'blank-town',
  '미상': 'unknown',
};

const FASHION_CATEGORY_LABELS = {
  hair: '헤어스타일',
  tops: '상의',
  bottoms: '하의',
  coords: '코디 세트',
  hats: '모자/액세서리',
  bags: '가방',
  shoes: '신발',
};

function compareKo(a, b) {
  return a.localeCompare(b, 'ko');
}

function toPublicImagePath(relPath) {
  const normalized = relPath.replace(/\\/g, '/').replace(/^images\//, 'images/');
  return `/${normalized}`;
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildPokemonSlug(number, dexGroup, occurrence, total) {
  const base = dexGroup === 'event' ? `event-${number}` : number;
  return total > 1 ? `${base}-${occurrence}` : base;
}

function buildPokemonSlugKey(reference, row) {
  const dexGroup = reference?.dex_group ?? (row.zukan_group_jp === 'イベント' ? 'event' : 'main');
  const ingameDexNo = reference?.ingame_dex_no ?? row.national_dex_no;
  return {
    dexGroup,
    number: String(ingameDexNo).padStart(3, '0'),
    key: `${dexGroup}:${String(ingameDexNo).padStart(3, '0')}`,
  };
}

function readJson(fileName) {
  return fs.readFile(path.join(SOURCE_DATA_DIR, fileName), 'utf8').then((content) => JSON.parse(content));
}

async function readMaterialKoMap(fileName) {
  const content = await fs.readFile(path.join(SOURCE_DATA_DIR, fileName), 'utf8');
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return new Map(
    lines.slice(1).map((line) => {
      const [jpTerm, koConfirmed] = line.split(',', 3);
      return [jpTerm, koConfirmed];
    })
  );
}

async function readHabitatNoMap(fileName) {
  const content = await fs.readFile(path.join(SOURCE_DATA_DIR, fileName), 'utf8');
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return new Map(
    lines
      .slice(1)
      .map((line) => {
        const [habitatNoRaw, habitatNameJp] = line.split(',', 3);
        const habitatNo = Number(habitatNoRaw);
        if (!Number.isFinite(habitatNo) || !habitatNameJp) {
          return null;
        }
        return [habitatNameJp, habitatNo];
      })
      .filter(Boolean)
  );
}

function buildIngameReferenceMap(referenceRows) {
  return new Map(referenceRows.map((row) => [row.source_name_jp, row]));
}

function getPrimaryMapInfo(jpName) {
  return PRIMARY_MAPS[jpName] ?? PRIMARY_MAPS['ー'];
}

function getRecordMapKey(name) {
  return RECORD_MAP_KEYS[name] ?? 'unknown';
}

function buildImageMaps(imageMatches) {
  const pokemonImages = new Map();
  const habitatImages = new Map();
  const fashionImages = {
    hair: new Map(),
    tops: new Map(),
    bottoms: new Map(),
    coords: new Map(),
    hats: new Map(),
    bags: new Map(),
    shoes: new Map(),
  };

  for (const match of imageMatches) {
    const imagePath = toPublicImagePath(match.planned_local_relpath);

    if (match.entity_type === 'pokemon') {
      pokemonImages.set(String(match.reference_id), imagePath);
      continue;
    }

    if (match.entity_type === 'habitat') {
      habitatImages.set(match.entity_name_ko, imagePath);
      continue;
    }

    if (match.entity_type === 'fashion' && fashionImages[match.entity_subtype]) {
      fashionImages[match.entity_subtype].set(match.entity_name_ko, imagePath);
    }
  }

  return { pokemonImages, habitatImages, fashionImages };
}

function parseRequirement(rawRequirement) {
  const trimmed = rawRequirement.trim();
  const quantityMatch = trimmed.match(/[×xX]\s*(\d+)\s*$/);
  const quantity = quantityMatch?.[1] ?? null;
  const base = trimmed
    .replace(/\s*[×xX]\s*\d+\s*$/, '')
    .replace(/\s*[×xX]\s*$/, '')
    .trim();

  return { base, quantity };
}

function translateRequirement(rawRequirement, materialKoMap, editorialMaterialKoMap) {
  const { base, quantity } = parseRequirement(rawRequirement);
  const translatedBase = materialKoMap.get(base) ?? editorialMaterialKoMap[base];

  if (!translatedBase) {
    return rawRequirement;
  }

  return quantity ? `${translatedBase} ×${quantity}` : translatedBase;
}

function buildHabitatRequirementMap(pokemonSource, materialKoMap, editorialMaterialKoMap) {
  const habitatRequirementMap = new Map();

  for (const row of pokemonSource) {
    for (const habitat of row.habitats_ko ?? []) {
      if (habitatRequirementMap.has(habitat.name_ko)) continue;
      const requirementsJp = habitat.requirements_jp ?? [];
      habitatRequirementMap.set(habitat.name_ko, {
        requirementsJp,
        requirementsKo: requirementsJp.map((requirement) => translateRequirement(requirement, materialKoMap, editorialMaterialKoMap)),
      });
    }
  }

  return habitatRequirementMap;
}

function buildHabitatNameJpByKoMap(pokemonSource) {
  const habitatNameJpByKo = new Map();

  for (const row of pokemonSource) {
    for (const habitat of row.habitats_ko ?? []) {
      if (!habitat.name_ko || !habitat.name_jp || habitatNameJpByKo.has(habitat.name_ko)) {
        continue;
      }
      habitatNameJpByKo.set(habitat.name_ko, habitat.name_jp);
    }

    if (row.primary_habitat_ko && row.primary_habitat_jp && !habitatNameJpByKo.has(row.primary_habitat_ko)) {
      habitatNameJpByKo.set(row.primary_habitat_ko, row.primary_habitat_jp);
    }
  }

  Object.entries(HABITAT_NAME_KO_TO_JP_ALIASES).forEach(([nameKo, nameJp]) => {
    if (!habitatNameJpByKo.has(nameKo)) {
      habitatNameJpByKo.set(nameKo, nameJp);
    }
  });

  return habitatNameJpByKo;
}

function buildHabitatIndex(pokemonSource, habitatImages, ingameReferenceByJp, habitatRequirementMap, habitatNoByJp) {
  const habitatNameJpByKo = buildHabitatNameJpByKoMap(pokemonSource);
  const habitatNames = unique([
    ...Array.from(habitatImages.keys()),
    ...pokemonSource.flatMap((row) => row.habitat_names_ko ?? []),
    ...pokemonSource.map((row) => row.primary_habitat_ko),
  ]).sort(compareKo);

  const habitatIdByName = new Map();
  const habitatsByName = new Map();
  const habitatMetaByName = new Map();

  habitatNames.forEach((name, index) => {
    const nameJp = habitatNameJpByKo.get(name) ?? null;
    const isEvent = Boolean(nameJp && EVENT_HABITAT_NAME_JP_SET.has(nameJp));
    const ingameHabitatNo = !isEvent && nameJp ? habitatNoByJp.get(nameJp) ?? null : null;
    const id = `habitat-${String(index + 1).padStart(3, '0')}`;
    const number = Number.isFinite(ingameHabitatNo) ? String(ingameHabitatNo).padStart(3, '0') : null;

    habitatIdByName.set(name, id);
    habitatMetaByName.set(name, {
      id,
      nameJp,
      ingameHabitatNo,
      number,
      isEvent,
    });
    habitatsByName.set(name, {
      id,
      name,
      nameJp,
      ingameHabitatNo,
      number,
      isEvent,
      imagePath: habitatImages.get(name) ?? null,
      requirementsJp: habitatRequirementMap.get(name)?.requirementsJp ?? [],
      requirementsKo: habitatRequirementMap.get(name)?.requirementsKo ?? [],
      pokemonEntries: [],
      primaryPokemonIds: [],
      mapNames: new Set(),
    });
  });

  const duplicateCounts = new Map();
  for (const row of pokemonSource) {
    const reference = ingameReferenceByJp.get(row.name_jp);
    const { key } = buildPokemonSlugKey(reference, row);
    duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1);
  }
  const occurrenceByDex = new Map();

  for (const row of pokemonSource) {
    const reference = ingameReferenceByJp.get(row.name_jp);
    const mapInfo = getPrimaryMapInfo(row.primary_map_jp);
    const { key, number, dexGroup } = buildPokemonSlugKey(reference, row);
    const occurrence = (occurrenceByDex.get(key) ?? 0) + 1;
    occurrenceByDex.set(key, occurrence);
    const slug = buildPokemonSlug(number, dexGroup, occurrence, duplicateCounts.get(key) ?? 1);
    const habitatNamesForPokemon = row.habitat_names_ko?.length
      ? row.habitat_names_ko
      : row.primary_habitat_ko
        ? [row.primary_habitat_ko]
        : [];

    for (const habitatName of habitatNamesForPokemon) {
      const habitat = habitatsByName.get(habitatName);
      if (!habitat) continue;
      habitat.pokemonEntries.push({
        dexNo: reference?.ingame_dex_no ?? row.national_dex_no,
        number,
        slug,
        name: reference?.display_name_ko ?? row.guide_name_ko,
        sortIndex: reference?.sort_index ?? row.national_dex_no,
      });
      habitat.mapNames.add(mapInfo.name);
      if (row.primary_habitat_ko === habitatName) {
        habitat.primaryPokemonIds.push(reference?.sort_index ?? row.national_dex_no);
      }
    }
  }

  const habitats = Array.from(habitatsByName.values())
    .map((habitat) => ({
      id: habitat.id,
      name: habitat.name,
      nameJp: habitat.nameJp,
      ingameHabitatNo: habitat.ingameHabitatNo,
      number: habitat.number,
      isEvent: habitat.isEvent,
      imagePath: habitat.imagePath,
      requirementsJp: habitat.requirementsJp,
      requirementsKo: habitat.requirementsKo,
      pokemonCount: habitat.pokemonEntries.length,
      primaryPokemonCount: habitat.primaryPokemonIds.length,
      pokemonEntries: habitat.pokemonEntries
        .sort((a, b) => a.sortIndex - b.sortIndex || compareKo(a.name, b.name))
        .map((entry) => ({
          dexNo: entry.dexNo,
          number: entry.number,
          slug: entry.slug,
          name: entry.name,
        })),
      mapNames: Array.from(habitat.mapNames).sort(compareKo),
    }))
    .sort((a, b) => {
      const aNo = a.ingameHabitatNo ?? Number.POSITIVE_INFINITY;
      const bNo = b.ingameHabitatNo ?? Number.POSITIVE_INFINITY;
      return aNo - bNo || b.pokemonCount - a.pokemonCount || compareKo(a.name, b.name);
    });

  return { habitats, habitatIdByName, habitatMetaByName };
}

function buildPokemon(pokemonSource, pokemonImages, habitatMetaByName, ingameReferenceByJp, materialKoMap, editorialMaterialKoMap) {
  const duplicateCounts = new Map();
  for (const row of pokemonSource) {
    const reference = ingameReferenceByJp.get(row.name_jp);
    const { key } = buildPokemonSlugKey(reference, row);
    duplicateCounts.set(key, (duplicateCounts.get(key) ?? 0) + 1);
  }
  const occurrenceByDex = new Map();

  return pokemonSource
    .map((row) => {
      const reference = ingameReferenceByJp.get(row.name_jp);
      const mapInfo = getPrimaryMapInfo(row.primary_map_jp);
      const ingameDexNo = reference?.ingame_dex_no ?? row.national_dex_no;
      const { key, number, dexGroup } = buildPokemonSlugKey(reference, row);
      const occurrence = (occurrenceByDex.get(key) ?? 0) + 1;
      occurrenceByDex.set(key, occurrence);
      const slug = buildPokemonSlug(number, dexGroup, occurrence, duplicateCounts.get(key) ?? 1);
      const specialties = (reference?.specialties_ko ?? []).map((nameKo) => ({
        nameJp: SPECIALTY_KO_TO_JP[nameKo] ?? nameKo,
        nameKo,
        translationStatus: reference?.specialty_status ?? 'source_jp',
      }));
      const taughtSkills = (row.taught_skills_jp ?? []).map((nameJp) => ({
        nameJp,
        nameKo: SKILL_LABELS[nameJp] ?? nameJp,
        translationStatus: SKILL_LABELS[nameJp] ? 'editorial' : 'raw',
      }));
      const habitats = (row.habitats_ko ?? []).map((habitat) => {
        const habitatMeta = habitatMetaByName.get(habitat.name_ko);

        return {
          id: habitatMeta?.id ?? null,
          number: habitatMeta?.number ?? null,
          ingameHabitatNo: habitatMeta?.ingameHabitatNo ?? null,
          isEvent: habitatMeta?.isEvent ?? false,
          name: habitat.name_ko,
          nameJp: habitat.name_jp,
          imagePath: null,
          rarityStars: habitat.rarity_stars,
          rarityLabel: HABITAT_RARITY_LABELS[habitat.rarity_label_jp] ?? habitat.rarity_label_jp,
          rarityLevel: habitat.rarity_stars.length,
          time: (habitat.time_jp ?? []).map((value) => TIME_LABELS[value] ?? value),
          weather: (habitat.weather_jp ?? []).map((value) => WEATHER_LABELS[value] ?? value),
          requirementsJp: habitat.requirements_jp ?? [],
          requirementsKo: (habitat.requirements_jp ?? []).map((requirement) => translateRequirement(requirement, materialKoMap, editorialMaterialKoMap)),
        };
      });

      const variantLabel =
        reference?.display_variant_label_ko || (row.variant_label_ko_guide ? row.variant_label_ko_guide : null);
      const variantTranslationStatus =
        reference?.display_name_ko && reference.display_name_ko !== row.guide_name_ko
          ? 'ingame_sheet'
          : row.variant_translation_status || null;

      return {
        id: reference?.sort_index ?? row.national_dex_no,
        slug,
        number,
        ingameDexNo,
        dexGroup,
        sortIndex: reference?.sort_index ?? row.national_dex_no,
        sourceNationalDexNo: row.national_dex_no,
        name: reference?.display_name_ko ?? row.guide_name_ko,
        officialName: row.name_ko,
        nameEn: row.name_en,
        nameJp: row.name_jp,
        variantLabel,
        variantTranslationStatus,
        isEditorialVariant: variantTranslationStatus === 'editorial_variant',
        isEvent: dexGroup === 'event',
        groupJp: row.zukan_group_jp,
        imagePath: pokemonImages.get(String(row.national_dex_no)) ?? null,
        types: (row.types_jp ?? []).map((nameJp) => ({
          nameJp,
          nameKo: TYPE_LABELS[nameJp] ?? nameJp,
        })),
        specialties,
        favoriteEnvironment: reference?.favorite_environment_ko ?? null,
        favoriteItems: reference?.favorite_items_ko ?? [],
        favoriteItemsNote: reference?.favorite_items_note_ko ?? null,
        favoriteItemVariants: reference?.favorite_item_variants_ko ?? [],
        extraMaterials: reference?.extra_materials_ko ?? [],
        slotVariantNames: reference?.slot_variant_names_ko ?? [],
        primaryHabitat: row.primary_habitat_ko || null,
        primaryHabitatId: row.primary_habitat_ko ? habitatMetaByName.get(row.primary_habitat_ko)?.id ?? null : null,
        primaryHabitatNo: row.primary_habitat_ko ? habitatMetaByName.get(row.primary_habitat_ko)?.ingameHabitatNo ?? null : null,
        primaryHabitatNumber: row.primary_habitat_ko ? habitatMetaByName.get(row.primary_habitat_ko)?.number ?? null : null,
        primaryHabitatIsEvent: row.primary_habitat_ko ? habitatMetaByName.get(row.primary_habitat_ko)?.isEvent ?? false : false,
        habitatNames: row.habitat_names_ko ?? [],
        primaryMap: mapInfo.name,
        primaryMapKey: mapInfo.key,
        primaryMapRecordLabel: mapInfo.recordName,
        habitats,
        taughtSkills,
        sourceGame8Url: row.source_game8_url,
        sourcePokemonKoreaUrl: row.source_pokemonkorea_url,
      };
    })
    .sort((a, b) => a.sortIndex - b.sortIndex);
}

function buildSpecialties(pokemon) {
  const groups = new Map();

  for (const entry of pokemon) {
    for (const specialty of entry.specialties) {
      if (!groups.has(specialty.nameJp)) {
        groups.set(specialty.nameJp, {
          id: `specialty-${specialty.nameJp}`,
          name: specialty.nameKo,
          nameJp: specialty.nameJp,
          translationStatus: specialty.translationStatus,
          pokemonIds: [],
        });
      }
      groups.get(specialty.nameJp).pokemonIds.push(entry.id);
    }
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      pokemonIds: group.pokemonIds.sort((a, b) => a - b),
      pokemonCount: group.pokemonIds.length,
    }))
    .sort((a, b) => b.pokemonCount - a.pokemonCount || compareKo(a.name, b.name));
}

function buildRecords(recordSource, fashionRewardSource, fashionImages) {
  const fashionRewardsByRecord = new Map();

  for (const reward of fashionRewardSource) {
    const recordId = Number(reward.global_order);
    if (!fashionRewardsByRecord.has(recordId)) {
      fashionRewardsByRecord.set(recordId, []);
    }

    const categoryKey = Object.keys(FASHION_CATEGORY_LABELS).find(
      (key) => FASHION_CATEGORY_LABELS[key] === reward.reward_category_ko
    );

    fashionRewardsByRecord.get(recordId).push({
      category: reward.reward_category_ko,
      categoryKey: categoryKey ?? null,
      name: reward.reward_item_name_ko_editorial,
      imagePath: categoryKey ? fashionImages[categoryKey].get(reward.reward_item_name_ko_editorial) ?? null : null,
    });
  }

  return recordSource.map((record) => ({
    id: Number(record.global_order),
    type: record.record_type_ko,
    orderInType: Number(record.record_order_in_type),
    name: record.record_name_ko_editorial,
    map: record.map_name_ko_editorial,
    mapKey: getRecordMapKey(record.map_name_ko_editorial),
    locationDetail: record.location_detail_ko_editorial,
    hasDirectReward: record.has_direct_reward === 'yes',
    directReward: record.direct_reward_ko_editorial || null,
    directRewardType: record.direct_reward_type_ko || null,
    hasFashionReward: record.has_fashion_reward === 'yes',
    fashionRewardCount: Number(record.fashion_reward_count || 0),
    fashionRewards: (fashionRewardsByRecord.get(Number(record.global_order)) ?? []).sort((a, b) => compareKo(a.category, b.category) || compareKo(a.name, b.name)),
    sourceGame8Url: record.source_game8_url,
  }));
}

function buildFashionCategories(imageMatches, fashionRewardSource, fashionImages) {
  const byCategory = Object.fromEntries(
    Object.entries(FASHION_CATEGORY_LABELS).map(([key, label]) => [key, { key, label, items: new Map() }])
  );

  for (const match of imageMatches) {
    if (match.entity_type !== 'fashion') continue;
    const category = byCategory[match.entity_subtype];
    if (!category) continue;
    category.items.set(match.entity_name_ko, {
      name: match.entity_name_ko,
      imagePath: toPublicImagePath(match.planned_local_relpath),
      unlockRecordIds: [],
      unlockRecordNames: [],
      maps: [],
    });
  }

  for (const reward of fashionRewardSource) {
    const categoryKey = Object.keys(FASHION_CATEGORY_LABELS).find(
      (key) => FASHION_CATEGORY_LABELS[key] === reward.reward_category_ko
    );
    if (!categoryKey) continue;
    const category = byCategory[categoryKey];
    if (!category.items.has(reward.reward_item_name_ko_editorial)) {
      category.items.set(reward.reward_item_name_ko_editorial, {
        name: reward.reward_item_name_ko_editorial,
        imagePath: fashionImages[categoryKey].get(reward.reward_item_name_ko_editorial) ?? null,
        unlockRecordIds: [],
        unlockRecordNames: [],
        maps: [],
      });
    }

    const item = category.items.get(reward.reward_item_name_ko_editorial);
    item.unlockRecordIds.push(Number(reward.global_order));
    item.unlockRecordNames.push(reward.record_name_ko_editorial);
    item.maps.push(reward.map_name_ko_editorial);
  }

  return Object.values(byCategory)
    .map((category) => ({
      key: category.key,
      label: category.label,
      items: Array.from(category.items.values())
        .map((item) => ({
          ...item,
          unlockRecordIds: unique(item.unlockRecordIds).sort((a, b) => a - b),
          unlockRecordNames: unique(item.unlockRecordNames).sort(compareKo),
          maps: unique(item.maps).sort(compareKo),
        }))
        .sort((a, b) => compareKo(a.name, b.name)),
    }))
    .sort((a, b) => Object.keys(FASHION_CATEGORY_LABELS).indexOf(a.key) - Object.keys(FASHION_CATEGORY_LABELS).indexOf(b.key));
}

function buildMaps(pokemon, records, habitats) {
  const mapBase = Object.values(PRIMARY_MAPS).map((mapInfo) => ({
    key: mapInfo.key,
    name: mapInfo.name,
    recordName: mapInfo.recordName,
    pokemonCount: 0,
    recordCount: 0,
    habitatCount: 0,
  }));

  const byKey = new Map(mapBase.map((item) => [item.key, item]));

  for (const entry of pokemon) {
    byKey.get(entry.primaryMapKey).pokemonCount += 1;
  }

  for (const record of records) {
    if (byKey.has(record.mapKey)) {
      byKey.get(record.mapKey).recordCount += 1;
    }
  }

  for (const habitat of habitats) {
    for (const mapName of habitat.mapNames) {
      const info = Object.values(PRIMARY_MAPS).find((item) => item.name === mapName);
      if (info && byKey.has(info.key)) {
        byKey.get(info.key).habitatCount += 1;
      }
    }
  }

  return mapBase.filter((item) => item.pokemonCount > 0 || item.recordCount > 0 || item.habitatCount > 0);
}

async function main() {
  const [
    pokemonSource,
    ingameReferenceRows,
    recordSource,
    fashionRewardSource,
    imageMatches,
    materialKoMap,
    editorialMaterialKoMap,
    habitatNoByJp,
  ] = await Promise.all([
    readJson('pokopia_pokemon_master_ko_guide.json'),
    readJson(INGAME_REFERENCE_FILE),
    readJson('pokopia_human_records_master_ko_editorial.json'),
    readJson('pokopia_human_record_fashion_rewards_ko_editorial.json'),
    readJson('pokopia_image_match_master.json'),
    readMaterialKoMap(HABITAT_MATERIAL_MAP_FILE),
    readJson(HABITAT_MATERIAL_EDITORIAL_MAP_FILE),
    readHabitatNoMap(HABITAT_NUMBER_REFERENCE_FILE),
  ]);

  const ingameReferenceByJp = buildIngameReferenceMap(ingameReferenceRows);
  const { pokemonImages, habitatImages, fashionImages } = buildImageMaps(imageMatches);
  const habitatRequirementMap = buildHabitatRequirementMap(pokemonSource, materialKoMap, editorialMaterialKoMap);
  const { habitats, habitatMetaByName } = buildHabitatIndex(
    pokemonSource,
    habitatImages,
    ingameReferenceByJp,
    habitatRequirementMap,
    habitatNoByJp
  );
  const pokemon = buildPokemon(
    pokemonSource,
    pokemonImages,
    habitatMetaByName,
    ingameReferenceByJp,
    materialKoMap,
    editorialMaterialKoMap
  ).map((entry) => ({
    ...entry,
    habitats: entry.habitats.map((habitat) => ({
      ...habitat,
      imagePath: habitat.name ? habitatImages.get(habitat.name) ?? null : null,
    })),
  }));
  const specialties = buildSpecialties(pokemon);
  const records = buildRecords(recordSource, fashionRewardSource, fashionImages);
  const fashionCategories = buildFashionCategories(imageMatches, fashionRewardSource, fashionImages);
  const maps = buildMaps(pokemon, records, habitats);

  const stats = {
    pokemonCount: pokemon.length,
    eventPokemonCount: pokemon.filter((entry) => entry.isEvent).length,
    habitatCount: habitats.length,
    recordCount: records.length,
    fashionItemCount: fashionCategories.reduce((sum, category) => sum + category.items.length, 0),
    specialtyCount: specialties.length,
    imageCount: imageMatches.length,
  };

  const siteData = {
    generatedAt: new Date().toISOString(),
    sourceRoot: SOURCE_ROOT,
    stats,
    maps,
    pokemon,
    habitats,
    specialties,
    records,
    fashionCategories,
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(siteData, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(JSON.stringify(stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
