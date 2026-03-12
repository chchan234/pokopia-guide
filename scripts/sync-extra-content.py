from __future__ import annotations

import csv
import hashlib
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from bs4 import BeautifulSoup

APP_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = Path(os.environ.get('POKOPIA_SOURCE_DIR', APP_ROOT.parents[2] / 'pokopia-guide')).resolve()
DATA_DIR = SOURCE_ROOT / 'data'
CACHE_DIR = SOURCE_ROOT / 'cache'
OUTPUT_DIR = APP_ROOT / 'src' / 'data'

DREAM_PAGE = CACHE_DIR / 'extra' / 'gamewith_dream_islands.html'
COOKING_PAGE = CACHE_DIR / 'extra' / 'gamewith_cooking.html'
RECIPE_PAGE = CACHE_DIR / 'extra' / 'gamewith_recipes.html'
CD_PAGE = CACHE_DIR / 'extra' / 'gamewith_cds.html'
PLUSH_PAGE = CACHE_DIR / 'image_match' / 'gamewith_plushes.html'
BUILDING_PAGE = CACHE_DIR / 'image_match' / 'gamewith_buildings.html'
BERRY_PAGE = CACHE_DIR / 'image_match' / 'gamewith_berries.html'
EMOTE_PAGE = CACHE_DIR / 'image_match' / 'gamewith_emotes.html'
BESTSHOT_PAGE = CACHE_DIR / 'image_match' / 'gamewith_bestshots.html'
MURAL_PAGE = CACHE_DIR / 'image_match' / 'gamewith_murals.html'
SLATE_PAGE = CACHE_DIR / 'image_match' / 'gamewith_slates.html'
ANCIENT_PAGE = CACHE_DIR / 'extra' / 'game8_ancient_items.html'
SITE_DATA_FILE = OUTPUT_DIR / 'site-data.json'
IMAGE_MATCH_FILE = DATA_DIR / 'pokopia_image_match_master.json'
MATERIAL_MAP_FILE = DATA_DIR / 'pokopia_habitat_material_editorial_map_ko.json'
HUMAN_RECORDS_FILE = DATA_DIR / 'pokopia_human_records_master_ko_editorial.csv'

DREAM_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/547183'
PLUSH_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/547269'
COOKING_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/545733'
RECIPE_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/545849'
BUILDING_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/545874'
BERRY_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/548099'
EMOTE_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/547532'
BESTSHOT_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/545339'
MURAL_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/547378'
SLATE_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/547445'
CD_SOURCE_URL = 'https://gamewith.jp/pocoapokemon/547433'
ANCIENT_SOURCE_URL = 'https://game8.jp/pocoapokemon/767411'

MAP_KO = {
    'パサパサこうやの街': '메마른 황야 마을',
    'ゴツゴツやまの街': '울퉁불퉁 산마을',
    'ドンヨリうみべの街': '우중충한 해변 마을',
    'キラキラうきしまの街': '반짝반짝 부유섬 마을',
    'まっさらな街': '빈 마을',
    'ゆめしま': '꿈섬',
    'どこでも': '어디서든',
}

DREAM_ISLAND_KO = {
    'こうやのゆめしま': '황야 꿈섬',
    'いわやまのゆめしま': '바위산 꿈섬',
    'かざんのゆめしま': '화산 꿈섬',
    'うなばらのゆめしま': '바다 꿈섬',
    'そらのゆめしま': '하늘 꿈섬',
    'ランダム': '랜덤',
}

MANUAL_KO = {
    'ピッピにんぎょう': '삐삐 인형',
    'みがわりにんぎょう': '대타 인형',
    'メタモンにんぎょう': '메타몽 인형',
    'まないた': '도마',
    'フライパン': '프라이팬',
    'なべ': '냄비',
    'パンがま': '빵가마',
    'サラダ': '샐러드',
    'ハンバーグ': '햄버그',
    'スープ': '수프',
    'パン': '빵',
    '普通': '보통',
    'あまい': '달콤함',
    'からい': '매콤함',
    'しぶい': '떫은맛',
    'すっぱい': '새콤함',
    'にがい': '쌉쌀함',
    'おおきなおとしもの': '큰 떨어진 물건',
    'ちいさなおとしもの': '작은 떨어진 물건',
    'かせき': '화석',
    'なぞのへきが': '수수께끼 벽화',
    'なぞのせきばん': '수수께끼 석판',
    'いにしえのもの': '고대의 물건',
    'CD': 'CD',
}

PLACE_REPLACEMENTS = {
    'ショップで購入': '상점 구매',
    'ショップでレシピを購入': '상점에서 레시피 구매',
    'ショップで': '상점에서 ',
    '環境レベル': '환경 레벨 ',
    'で拾う': '에서 줍기',
    'で入手': '에서 획득',
    '入手時にひらめく': '획득 시 영감',
    '日替わり': '일일 교체',
    'ストーリーでクラフト台解放時に入手': '스토리에서 제작대 해금 시 획득',
    'ストーリーで': '스토리 진행으로 ',
    'のストーリー中に入手': ' 스토리 중 획득',
    'のストーリークリア後': ' 스토리 클리어 후',
    'ポケモン図鑑': '포켓몬 도감 ',
    '匹登録時の報酬': '마리 등록 보상',
    '初回鑑定時': '첫 감정 시',
    '解放': '해금',
    'Lv': 'Lv',
    'レベル': 'Lv',
    '北部': '북부',
    '東部': '동부',
    '南部': '남부',
    '西部': '서부',
    '水面のキラキラから入手': '수면 반짝임에서 획득',
    '水の中のキラキラから入手': '물속 반짝임에서 획득',
    '水のキラキラからランダムで入手': '물 반짝임에서 랜덤 획득',
    'ごつごつやまの街環境レベル5で': '울퉁불퉁 산마을 환경 레벨 5에서 ',
    'ゴツゴツやまの街環境レベル2で': '울퉁불퉁 산마을 환경 레벨 2에서 ',
    'まっさらな街環境レベル6で': '빈 마을 환경 레벨 6에서 ',
    'まっさらな街環境レベル7で': '빈 마을 환경 레벨 7에서 ',
    'まっさらな街環境レベル8で': '빈 마을 환경 레벨 8에서 ',
}

COOKING_EFFECT_REPLACEMENTS = {
    'すると生息地にポケモンがかなり現れやすくなる': '공물로 바치면 서식지에 포켓몬이 훨씬 잘 나타난다',
    'すると生息地にポケモンがまあまあ現れやすくなる': '공물로 바치면 서식지에 포켓몬이 비교적 잘 나타난다',
    'するとポケモンとかなり仲良くなれる': '공물로 바치면 포켓몬과 훨씬 빨리 친해진다',
    'するとポケモンとまあまあ仲良くなれる': '공물로 바치면 포켓몬과 비교적 빨리 친해진다',
    'するとめずらしいものがかなり見つかりやすくなる': '공물로 바치면 희귀한 것을 훨씬 쉽게 찾는다',
    'するとめずらしいものがまあまあ見つかりやすくなる': '공물로 바치면 희귀한 것을 비교적 쉽게 찾는다',
    'するとショップにいいものがかなり並びやすくなる': '공물로 바치면 상점에 좋은 물건이 훨씬 잘 뜬다',
    'するとショップにいいものがまあまあ並びやすくなる': '공물로 바치면 상점에 좋은 물건이 비교적 잘 뜬다',
    'すると いにしえのもの がかなり現れやすくなる': '공물로 바치면 고대의 물건이 훨씬 잘 나온다',
    'すると いにしえのもの がまあまあ現れやすくなる': '공물로 바치면 고대의 물건이 비교적 잘 나온다',
    'すると ホウオウ / ルギア をかなり見かけやすくなる': '공물로 바치면 호우오우 / 루기아를 훨씬 자주 본다',
    'すると ホウオウ / ルギア をまあまあ見かけやすくなる': '공물로 바치면 호우오우 / 루기아를 비교적 자주 본다',
}

BESTSHOT_CONDITION_KO = {
    'たき火でぽかぽか': '모닥불 주변에서 자고 있는 포켓몬을 촬영',
    'かぜおこしで回せ': '바람개비 근처에 있는 구구를 촬영',
    'うなるマッハのこぶし': '샌드백으로 연습하는 홍수몬을 촬영',
    '大きなねどこで仲良くグッスリ': '나무 침대에서 함께 자는 포켓몬 2마리를 촬영',
    '水浴びサイコー！': '샤워 중인 포켓몬을 촬영',
}

SPECIAL_COLLECTION_NOTE_KO = {
    'なぞのへきが': '메마른 황야 포켓몬센터 뒤쪽 숨은 방에서 확인할 수 있는 벽화. 석판을 모두 맞추면 뮤가 출현한다.',
    'なぞのせきばん': '빛나는 땅을 파서 모으는 수집품. 벽화 슬롯 27칸에 맞는 언노운 형태를 끼워 넣는다.',
}

COOKING_CATEGORY_ORDER = ['サラダ', 'ハンバーグ', 'スープ', 'パン']
BUILDING_NAMES = [
    'ともしびのさいだんキット',
    'はっぱのおへやキット',
    'はっぱのりっぱなキット',
    '風力はつでんキット',
    'ふたごのひむろキット',
    'むじんはつでんしょキット',
]
DREAM_ISLAND_NAMES = ['こうやのゆめしま', 'いわやまのゆめしま', 'かざんのゆめしま', 'うなばらのゆめしま', 'そらのゆめしま']


@dataclass(frozen=True)
class ImageEntry:
    name_jp: str
    name_ko: str | None
    image_path: str


def load_site_data() -> dict:
    return json.loads(SITE_DATA_FILE.read_text(encoding='utf-8'))


def load_material_map() -> dict[str, str]:
    raw = json.loads(MATERIAL_MAP_FILE.read_text(encoding='utf-8'))
    return {key: value for key, value in raw.items() if value}


def load_image_maps() -> dict[str, dict[str, ImageEntry]]:
    raw = json.loads(IMAGE_MATCH_FILE.read_text(encoding='utf-8'))
    groups: dict[str, dict[str, ImageEntry]] = {
        'berry': {},
        'emote': {},
        'bestshot': {},
        'murals': {},
        'slates': {},
    }

    for entry in raw:
        relpath = entry.get('planned_local_relpath')
        if not relpath:
            continue

        image_path = '/' + relpath.replace('\\', '/').lstrip('/')
        image = ImageEntry(entry['entity_name_jp'], entry.get('entity_name_ko') or None, image_path)

        if entry['entity_type'] == 'item' and entry['entity_subtype'] == 'berry':
            groups['berry'][entry['entity_name_jp']] = image
        elif entry['entity_type'] == 'emote':
            groups['emote'][entry['entity_name_jp']] = image
        elif entry['entity_type'] == 'bestshot':
            groups['bestshot'][entry['entity_name_jp']] = image
        elif entry['entity_type'] == 'collection' and entry['entity_subtype'] == 'murals':
            groups['murals'][entry['entity_name_jp']] = image
        elif entry['entity_type'] == 'collection' and entry['entity_subtype'] == 'slates':
            groups['slates'][entry['entity_name_jp']] = image

    return groups


def build_name_maps(site_data: dict) -> tuple[dict[str, str], dict[str, str]]:
    pokemon_ko = {entry['nameJp']: entry['officialName'] for entry in site_data['pokemon']}
    label_ko: dict[str, str] = {}

    for pokemon in site_data['pokemon']:
        for group in ('specialties', 'taughtSkills'):
            for label in pokemon.get(group, []):
                label_ko[label['nameJp']] = label['nameKo']

    return pokemon_ko, label_ko


def body_texts(path: Path) -> list[str]:
    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    body = soup.select_one('#article-body')
    if body is None:
        raise RuntimeError(f'Could not find article body in {path}')
    return [text.strip() for text in body.stripped_strings]


def slugify(text: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', text.lower())
    slug = slug.strip('-')
    if slug:
        return slug
    digest = hashlib.md5(text.encode('utf-8')).hexdigest()[:10]
    return f'entry-{digest}'


def ko_name(name_jp: str, pokemon_ko: dict[str, str], material_map: dict[str, str], label_ko: dict[str, str]) -> str | None:
    if name_jp in MANUAL_KO:
        return MANUAL_KO[name_jp]
    if name_jp in material_map:
        return material_map[name_jp]
    if name_jp in pokemon_ko:
        return pokemon_ko[name_jp]
    if name_jp in label_ko:
        return label_ko[name_jp]
    if name_jp in DREAM_ISLAND_KO:
        return DREAM_ISLAND_KO[name_jp]
    return None


def replace_all(text: str, mapping: dict[str, str]) -> str:
    result = text
    for source, target in sorted(mapping.items(), key=lambda item: len(item[0]), reverse=True):
        result = result.replace(source, target)
    return result


def translate_place_text(text: str) -> str:
    translated = replace_all(text, PLACE_REPLACEMENTS)
    translated = translated.replace('▶行き方動画', '')
    translated = translated.replace('▶場所マップ', '')
    translated = translated.replace('のダウジングでも入手可能', ' 다우징으로도 획득 가능')
    translated = translated.replace('のダウジングで入手', ' 다우징으로 획득')
    translated = translated.replace('ダウジングで入手', '다우징으로 획득')
    translated = replace_all(translated, MAP_KO)
    translated = translated.replace('で入手可能', '에서 획득 가능')
    translated = translated.replace('で入手', '에서 획득')
    translated = translated.replace('(', ' (').replace(' )', ')').replace('  ', ' ').strip()
    return translated


def translate_cooking_effect(text: str, pokemon_ko: dict[str, str]) -> str:
    normalized = ' '.join(text.split())
    normalized = replace_all(normalized, COOKING_EFFECT_REPLACEMENTS)
    normalized = replace_all(normalized, pokemon_ko)
    normalized = normalized.replace('すると', '공물로 바치면').replace('かなり', '훨씬').replace('まあまあ', '비교적')
    normalized = normalized.replace('見かけやすくなる', '자주 보게 된다')
    normalized = normalized.replace('現れやすくなる', '잘 나온다')
    normalized = normalized.replace('並びやすくなる', '잘 뜬다')
    normalized = normalized.replace('仲良くなれる', '친해진다')
    normalized = normalized.replace('見つかりやすくなる', '쉽게 찾는다')
    normalized = normalized.replace('いにしえのもの', '고대의 물건')
    normalized = normalized.replace('ホウオウ', pokemon_ko.get('ホウオウ', '호우오우'))
    normalized = normalized.replace('ルギア', pokemon_ko.get('ルギア', '루기아'))
    return normalized.strip()


def parse_dream_islands(pokemon_ko: dict[str, str], material_map: dict[str, str]) -> tuple[list[dict], list[dict], dict]:
    texts = body_texts(DREAM_PAGE)
    index = texts.index('こうやのゆめしま')
    islands: list[dict] = []

    while index < len(texts):
        name_jp = texts[index]
        if name_jp == '▶人形の場所一覧と行ける夢島':
            break

        island: dict[str, object] = {
            'id': slugify(name_jp),
            'nameJp': name_jp,
            'nameKo': DREAM_ISLAND_KO.get(name_jp),
            'sourceUrl': DREAM_SOURCE_URL,
        }
        index += 1

        if texts[index] != '必要な人形':
            raise RuntimeError(f'Unexpected dream island layout near {name_jp}')
        index += 1
        doll_jp = texts[index]
        index += 1
        doll_note_tokens: list[str] = []
        while texts[index] not in {'伝説', '見つかる物'}:
            doll_note_tokens.append(texts[index])
            index += 1

        if texts[index] == '伝説':
            legendary_jp = texts[index + 1]
            index += 2
        else:
            legendary_jp = None

        if texts[index] != '見つかる物':
            raise RuntimeError(f'Missing findings section for {name_jp}')
        index += 1

        findings_jp: list[str] = []
        while index < len(texts) and texts[index] not in {*DREAM_ISLAND_NAMES, '▶人形の場所一覧と行ける夢島'}:
            findings_jp.append(texts[index])
            index += 1

        find_list = [item for item in findings_jp if item not in {'(ランダム)'}]
        notes: list[str] = []
        if '各種CD' in findings_jp:
            notes.append('CD는 종류가 랜덤으로 나온다')
        if 'ニンゲンのきろく' in findings_jp:
            notes.append('인간의 기록도 랜덤 보상으로 나온다')

        island.update(
            {
                'requiredDollJp': doll_jp,
                'requiredDollKo': ko_name(doll_jp, pokemon_ko, material_map, {}),
                'requiredDollNoteJp': ' '.join(doll_note_tokens).strip(),
                'requiredDollNoteKo': translate_place_text(' '.join(doll_note_tokens).strip()),
                'legendaryJp': legendary_jp,
                'legendaryKo': pokemon_ko.get(legendary_jp) if legendary_jp else None,
                'findingsJp': find_list,
                'findingsKo': [ko_name(item, pokemon_ko, material_map, {}) or item for item in find_list],
                'notesKo': notes,
            }
        )
        islands.append(island)

    plush_texts = body_texts(PLUSH_PAGE)
    index = plush_texts.index('イーブイにんぎょう')
    dolls: list[dict] = []
    while index < len(plush_texts):
        name_jp = plush_texts[index]
        if name_jp == '人形の入手方法':
            break
        map_jp = plush_texts[index + 2]
        dream_jp = plush_texts[index + 4]
        index += 5
        note_tokens: list[str] = []
        while index < len(plush_texts) and plush_texts[index] not in {'人形の入手方法', *[entry['requiredDollJp'] for entry in islands], 'みがわりにんぎょう', 'メタモンにんぎょう'}:
            note_tokens.append(plush_texts[index])
            index += 1

        dolls.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': ko_name(name_jp, pokemon_ko, material_map, {}),
                'mapJp': map_jp,
                'mapKo': MAP_KO.get(map_jp, map_jp),
                'dreamIslandJp': dream_jp,
                'dreamIslandKo': DREAM_ISLAND_KO.get(dream_jp, dream_jp),
                'noteJp': ' '.join(note_tokens).strip(),
                'noteKo': translate_place_text(' '.join(note_tokens).strip()),
                'sourceUrl': PLUSH_SOURCE_URL,
            }
        )

    with HUMAN_RECORDS_FILE.open(encoding='utf-8') as file:
        rows = list(csv.DictReader(file))
    dream_records = [row for row in rows if row['map_name_ko_editorial'] == '꿈섬']
    direct_types = [row['direct_reward_type_ko'] for row in dream_records if row['direct_reward_type_ko']]
    summary = {
        'recordCount': len(dream_records),
        'directRewardCount': sum(row['has_direct_reward'] == 'yes' for row in dream_records),
        'fashionRewardCount': sum(row['has_fashion_reward'] == 'yes' for row in dream_records),
        'directRewardTypes': {
            reward_type: direct_types.count(reward_type) for reward_type in sorted(set(direct_types), key=lambda value: ('감정표현', '헤어', '코디 세트').index(value) if value in {'감정표현', '헤어', '코디 세트'} else 99)
        },
        'notesKo': [
            '꿈섬 기록은 대부분 맵 중앙 동굴에 몰려 있다',
            '윈디 인형을 건네 열리는 화산 꿈섬 예외 기록도 있다',
        ],
    }

    return islands, dolls, summary


def parse_cooking(label_ko: dict[str, str], pokemon_ko: dict[str, str]) -> dict:
    texts = body_texts(COOKING_PAGE)
    dish_names = [texts[index - 1] for index, text in enumerate(texts) if text.startswith('料理：')]
    dish_set = set(dish_names)
    index = texts.index(dish_names[0])
    dishes: list[dict] = []

    while index < len(texts):
        name_jp = texts[index]
        if name_jp == 'ぽこあポケモンの':
            break

        category_jp = texts[index + 1].split('：', 1)[1]
        taste_jp = texts[index + 2]
        index += 3

        if texts[index] != '素材':
            raise RuntimeError(f'Unexpected cooking layout near {name_jp}')
        index += 1
        materials_jp: list[str] = []
        while texts[index] not in {'必要', '調理器具'}:
            materials_jp.append(texts[index])
            index += 1

        helper_jp = None
        if texts[index] == '必要':
            helper_jp = texts[index + 1]
            index += 3

        if texts[index] != '調理器具':
            raise RuntimeError(f'Missing cooking tool near {name_jp}')
        tool_jp = texts[index + 1]
        boost_text = texts[index + 2]
        index += 3

        if texts[index] != 'お供え':
            raise RuntimeError(f'Missing offering section near {name_jp}')
        index += 1
        offering_parts: list[str] = []
        while index < len(texts) and texts[index] not in dish_set and texts[index] != 'ぽこあポケモンの':
            offering_parts.append(texts[index])
            index += 1

        boosted_skill_jp = re.search(r'「(.+?)」', boost_text).group(1)
        offering_jp = ' '.join(offering_parts).strip()

        dishes.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': None,
                'categoryJp': category_jp,
                'categoryKo': ko_name(category_jp, {}, {}, label_ko),
                'tasteJp': taste_jp,
                'tasteKo': MANUAL_KO.get(taste_jp),
                'materialsJp': materials_jp,
                'materialsKo': [MANUAL_KO.get(item, item) for item in materials_jp],
                'helperSpecialtyJp': helper_jp,
                'helperSpecialtyKo': label_ko.get(helper_jp) if helper_jp else None,
                'toolJp': tool_jp,
                'toolKo': MANUAL_KO.get(tool_jp),
                'boostedSkillJp': boosted_skill_jp,
                'boostedSkillKo': label_ko.get(boosted_skill_jp),
                'boostSummaryJp': boost_text,
                'offeringEffectJp': offering_jp,
                'offeringEffectKo': translate_cooking_effect(offering_jp, pokemon_ko),
                'sourceUrl': COOKING_SOURCE_URL,
            }
        )

    tool_cards = [
        {
            'toolJp': 'まないた',
            'toolKo': '도마',
            'mainIngredientJp': 'はっぱ',
            'mainIngredientKo': '잎사귀',
            'dishTypeJp': 'サラダ',
            'dishTypeKo': '샐러드',
        },
        {
            'toolJp': 'フライパン',
            'toolKo': '프라이팬',
            'mainIngredientJp': 'マメ',
            'mainIngredientKo': '콩',
            'dishTypeJp': 'ハンバーグ',
            'dishTypeKo': '햄버그',
        },
        {
            'toolJp': 'なべ',
            'toolKo': '냄비',
            'mainIngredientJp': 'おいしいみず',
            'mainIngredientKo': '맛있는 물',
            'dishTypeJp': 'スープ',
            'dishTypeKo': '수프',
        },
        {
            'toolJp': 'パンがま',
            'toolKo': '빵가마',
            'mainIngredientJp': 'コムギ',
            'mainIngredientKo': '밀',
            'dishTypeJp': 'パン',
            'dishTypeKo': '빵',
        },
    ]

    category_effects = [
        {'categoryJp': 'サラダ', 'categoryKo': '샐러드', 'skillJp': 'このは', 'skillKo': label_ko.get('このは'), 'effectKo': '범위가 십자형으로 넓어지고 바위/벽에 이끼와 덩굴을 만들 수 있다'},
        {'categoryJp': 'ハンバーグ', 'categoryKo': '햄버그', 'skillJp': 'いわくだき', 'skillKo': label_ko.get('いわくだき'), 'effectKo': '단단한 소재 파괴 효율이 크게 오른다'},
        {'categoryJp': 'スープ', 'categoryKo': '수프', 'skillJp': 'みずでっぽう', 'skillKo': label_ko.get('みずでっぽう'), 'effectKo': '원거리 물 활용 성능이 올라가 탐색이 편해진다'},
        {'categoryJp': 'パン', 'categoryKo': '빵', 'skillJp': 'いあいぎり', 'skillKo': label_ko.get('いあいぎり'), 'effectKo': '금속 장벽까지 자를 수 있고 차지 범위가 넓어진다'},
    ]

    recommended = [
        {
            'nameJp': 'ジャガイモハンバーグ',
            'reasonKo': '바위깨기 강화폭이 커서 채굴, 정지 작업, 포케메탈 파밍에 가장 쓰기 좋다',
        },
        {
            'nameJp': 'アツアツスープパン',
            'reasonKo': '공물로 바치면 서식지 포켓몬 출현률을 크게 올려 희귀 포켓몬 탐색에 유리하다',
        },
    ]

    return {
        'sourceUrls': [COOKING_SOURCE_URL],
        'summary': {
            'dishCount': len(dishes),
            'toolCount': len(tool_cards),
            'categoryCount': len(COOKING_CATEGORY_ORDER),
            'notesKo': [
                '요리 해금은 울퉁불퉁 산 스토리 진행 이후',
                '근처 포켓몬이 도와주면 레시피 결과가 달라질 수 있다',
                '정식 한국어 표기가 확인되지 않은 요리명은 일본어 원문을 병기했다',
            ],
        },
        'toolCards': tool_cards,
        'categoryEffects': category_effects,
        'recommended': recommended,
        'dishes': dishes,
    }


def parse_recipe_data() -> tuple[list[dict], list[dict]]:
    texts = body_texts(RECIPE_PAGE)
    shop_entries: list[dict] = []
    index = texts.index('クラフトだいのレシピ')
    while texts[index] != 'たきび':
        name_jp = texts[index]
        location_jp = texts[index + 2]
        price = int(texts[index + 4]) if texts[index + 4].isdigit() else None
        shop_entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'sourceType': 'shop',
                'sourceJp': location_jp,
                'sourceKo': translate_place_text(location_jp),
                'price': price,
                'sourceUrl': RECIPE_SOURCE_URL,
            }
        )
        index += 5

    other_entries: list[dict] = []
    while index < len(texts) and texts[index] != 'クラフトレシピの入手方法':
        name_jp = texts[index]
        index += 2
        condition_parts: list[str] = []
        while index < len(texts) and not (index + 1 < len(texts) and texts[index + 1] == '入手') and texts[index] != 'クラフトレシピの入手方法':
            condition_parts.append(texts[index])
            index += 1

        condition_jp = ' '.join(condition_parts).strip()
        other_entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'sourceType': 'other',
                'sourceJp': condition_jp,
                'sourceKo': translate_place_text(condition_jp),
                'price': None,
                'sourceUrl': RECIPE_SOURCE_URL,
            }
        )

    return shop_entries, other_entries


def parse_buildings(label_ko: dict[str, str], pokemon_ko: dict[str, str], material_map: dict[str, str]) -> list[dict]:
    texts = body_texts(BUILDING_PAGE)
    index = texts.index(BUILDING_NAMES[0])
    entries: list[dict] = []

    while index < len(texts):
        name_jp = texts[index]
        if name_jp == '建物の建て方':
            break
        entry_type = texts[index + 1]
        index += 2

        entry: dict[str, object] = {
            'id': slugify(name_jp),
            'nameJp': name_jp,
            'nameKo': ko_name(name_jp, pokemon_ko, material_map, label_ko),
            'typeJp': entry_type,
            'typeKo': MANUAL_KO.get(entry_type, entry_type),
            'sourceUrl': BUILDING_SOURCE_URL,
            'imagePath': None,
        }

        if entry_type in {'建物', '家'}:
            entry['capacity'] = texts[index]
            entry['buildTime'] = texts[index + 1]
            index += 2
            index += 1  # 使い道
            use_parts: list[str] = []
            while texts[index] != 'レシピ':
                use_parts.append(texts[index])
                index += 1
            index += 1
            recipe_jp = texts[index]
            index += 1
            index += 1  # 必要得意
            specialties_jp: list[str] = []
            while texts[index] != '必要素材':
                specialties_jp.append(texts[index])
                index += 1
            index += 1
            materials_jp: list[str] = []
            while index < len(texts) and texts[index] not in {*BUILDING_NAMES, '建物の建て方'}:
                materials_jp.append(texts[index])
                index += 1
            entry.update(
                {
                    'useJp': ' '.join(use_parts),
                    'useKo': replace_all(' '.join(use_parts), pokemon_ko),
                    'recipeJp': recipe_jp,
                    'recipeKo': translate_place_text(recipe_jp),
                    'requiredSpecialtiesJp': specialties_jp,
                    'requiredSpecialtiesKo': [label_ko.get(item, item) for item in specialties_jp],
                    'requiredMaterialsJp': materials_jp,
                    'requiredMaterialsKo': [ko_name(item, pokemon_ko, material_map, label_ko) or item for item in materials_jp],
                }
            )
        else:
            index += 1  # 説明
            desc_parts: list[str] = []
            while index < len(texts) and texts[index] not in {*BUILDING_NAMES, '建物の建て方'}:
                desc_parts.append(texts[index])
                index += 1
            entry.update(
                {
                    'descriptionJp': ' '.join(desc_parts),
                    'descriptionKo': replace_all(' '.join(desc_parts), label_ko),
                    'useJp': None,
                    'useKo': None,
                    'recipeJp': None,
                    'recipeKo': None,
                    'requiredSpecialtiesJp': [],
                    'requiredSpecialtiesKo': [],
                    'requiredMaterialsJp': [],
                    'requiredMaterialsKo': [],
                    'capacity': None,
                    'buildTime': None,
                }
            )
        entries.append(entry)

    return entries


def parse_dolls(pokemon_ko: dict[str, str], material_map: dict[str, str]) -> list[dict]:
    texts = body_texts(PLUSH_PAGE)
    index = texts.index('イーブイにんぎょう')
    entries: list[dict] = []

    while index < len(texts):
        name_jp = texts[index]
        if name_jp == '人形の入手方法':
            break
        map_jp = texts[index + 2]
        dream_jp = texts[index + 4]
        index += 5
        note_parts: list[str] = []
        while index < len(texts) and texts[index] not in {'人形の入手方法', 'イーブイにんぎょう', 'ピカチュウにんぎょう', 'カイリューにんぎょう', 'ピッピにんぎょう', 'ウインディにんぎょう', 'みがわりにんぎょう', 'メタモンにんぎょう'}:
            note_parts.append(texts[index])
            index += 1

        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': ko_name(name_jp, pokemon_ko, material_map, {}),
                'mapJp': map_jp,
                'mapKo': MAP_KO.get(map_jp, map_jp),
                'dreamIslandJp': dream_jp,
                'dreamIslandKo': DREAM_ISLAND_KO.get(dream_jp, dream_jp),
                'noteJp': ' '.join(note_parts).strip(),
                'noteKo': translate_place_text(' '.join(note_parts).strip()),
                'imagePath': None,
                'sourceUrl': PLUSH_SOURCE_URL,
            }
        )

    return entries


def parse_berries(image_map: dict[str, ImageEntry]) -> list[dict]:
    texts = body_texts(BERRY_PAGE)
    entries = [
        {
            'id': 'ヒメリのみ',
            'nameJp': 'ヒメリのみ',
            'nameKo': None,
            'imagePath': None,
            'obtainJp': '자연 생성 + 나무 재배',
            'obtainKo': '기본 자연 생성 열매이며 직접 키우는 루트의 기준 열매',
            'notesKo': [
                '히메리열매 + 다른 1종은 자연 생성',
                '열매는 1시간에 1개씩 자라며 한 나무에 최대 3개까지 열린다',
            ],
            'sourceUrl': BERRY_SOURCE_URL,
        }
    ]

    pattern = [
        ('ラムのみ', 'ゴツゴツやまのコレクレーの館の先', 'コレクレーの館 가장 오른쪽 문 너머 용암지대의 몬스터볼'),
        ('モモンのみ', 'ゴツゴツやまの溶岩湖の脇道', '화산 입구를 지나 용암호수 옆길의 몬스터볼'),
        ('ナナシのみ', 'ドンヨリうみべの滝', '우중충한 해변 폭포 쪽 몬스터볼'),
        ('カゴのみ', 'ドンヨリうみべのドーブル近く', '도중 중앙 아래쪽 도브 근처'),
        ('チーゴのみ', 'キラキラうきしまの左上の島', '좌상단 섬의 덩굴 구멍 안쪽 몬스터볼'),
    ]

    for name_jp, obtain_jp, obtain_ko in pattern:
        image = image_map.get(name_jp)
        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': image.name_ko if image else None,
                'imagePath': image.image_path if image else None,
                'obtainJp': obtain_jp,
                'obtainKo': translate_place_text(obtain_ko),
                'notesKo': [
                    '자연 생성 1종은 유저마다 다르다',
                    '거래 특기가 있으면 교환으로 다른 열매를 보충할 수 있다',
                ],
                'sourceUrl': BERRY_SOURCE_URL,
            }
        )

    return entries


def parse_emotes(image_map: dict[str, ImageEntry]) -> list[dict]:
    texts = body_texts(EMOTE_PAGE)
    index = texts.index('ヤッター！')
    entries: list[dict] = []

    while index < len(texts):
        name_jp = texts[index]
        if name_jp == 'エモートの使い方':
            break
        obtain_jp = texts[index + 2]
        index += 3
        if index < len(texts) and texts[index] == '▶場所マップ':
            index += 1
        image = image_map.get(name_jp)
        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': image.name_ko if image else None,
                'imagePath': image.image_path if image else None,
                'obtainJp': obtain_jp,
                'obtainKo': translate_place_text(obtain_jp),
                'sourceUrl': EMOTE_SOURCE_URL,
            }
        )

    return entries


def parse_bestshots(image_map: dict[str, ImageEntry]) -> list[dict]:
    texts = body_texts(BESTSHOT_PAGE)
    index = texts.index('たき火でぽかぽか')
    entries: list[dict] = []

    while index < len(texts):
        name_jp = texts[index]
        if name_jp == 'ベストショットの撮り方':
            break
        condition_jp = texts[index + 2]
        reward_jp = texts[index + 4]
        index += 5
        image = image_map.get(name_jp)
        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': image.name_ko if image else None,
                'imagePath': image.image_path if image else None,
                'conditionJp': condition_jp,
                'conditionKo': BESTSHOT_CONDITION_KO.get(name_jp, condition_jp),
                'rewardJp': reward_jp,
                'rewardKo': translate_place_text(reward_jp),
                'sourceUrl': BESTSHOT_SOURCE_URL,
            }
        )

    return entries


def parse_cds() -> list[dict]:
    texts = body_texts(CD_PAGE)
    names = texts[8:51]
    return [
        {
            'id': slugify(name_jp),
            'nameJp': name_jp,
            'nameKo': None,
            'obtainJp': '光る地面を掘ってランダム入手',
            'obtainKo': '빛나는 땅을 파서 랜덤 획득',
            'useKo': '아게↑로토무 또는 CD 플레이어에 넣어 마을 BGM으로 재생',
            'sourceUrl': CD_SOURCE_URL,
        }
        for name_jp in names
    ]


def parse_special_collections(image_groups: dict[str, dict[str, ImageEntry]]) -> list[dict]:
    mural = image_groups['murals'].get('なぞのへきが')
    slate = image_groups['slates'].get('なぞのせきばん')
    return [
        {
            'id': 'mural',
            'nameJp': 'なぞのへきが',
            'nameKo': '수수께끼 벽화',
            'imagePath': mural.image_path if mural else None,
            'summaryKo': SPECIAL_COLLECTION_NOTE_KO['なぞのへきが'],
            'sourceUrl': MURAL_SOURCE_URL,
        },
        {
            'id': 'slate',
            'nameJp': 'なぞのせきばん',
            'nameKo': '수수께끼 석판',
            'imagePath': slate.image_path if slate else None,
            'summaryKo': SPECIAL_COLLECTION_NOTE_KO['なぞのせきばん'],
            'sourceUrl': SLATE_SOURCE_URL,
        },
    ]


def parse_ancient_groups() -> list[dict]:
    texts = [text.strip() for text in BeautifulSoup(ANCIENT_PAGE.read_text(encoding='utf-8', errors='ignore'), 'html.parser').stripped_strings]

    big_items = [{'number': int(texts[index]), 'nameJp': texts[index + 1], 'nameKo': None} for index in range(75, 149, 2)]
    small_items = [{'number': int(texts[index]), 'nameJp': texts[index + 1], 'nameKo': None} for index in range(155, 247, 2)]
    fossils = [
        {
            'nameJp': texts[index],
            'nameKo': None,
            'mapJp': texts[index + 1],
            'mapKo': MAP_KO.get(texts[index + 1], texts[index + 1]),
        }
        for index in range(254, 298, 2)
    ]

    return [
        {
            'id': 'large-lost',
            'nameJp': 'おおきなおとしもの',
            'nameKo': MANUAL_KO['おおきなおとしもの'],
            'count': 37,
            'items': big_items,
        },
        {
            'id': 'small-lost',
            'nameJp': 'ちいさなおとしもの',
            'nameKo': MANUAL_KO['ちいさなおとしもの'],
            'count': 46,
            'items': small_items,
        },
        {
            'id': 'fossils',
            'nameJp': 'かせき',
            'nameKo': MANUAL_KO['かせき'],
            'count': 22,
            'items': fossils,
        },
    ]


def build_items_payload(
    label_ko: dict[str, str],
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    image_groups: dict[str, dict[str, ImageEntry]],
) -> dict:
    shop_recipes, other_recipes = parse_recipe_data()
    buildings = parse_buildings(label_ko, pokemon_ko, material_map)
    dolls = parse_dolls(pokemon_ko, material_map)
    berries = parse_berries(image_groups['berry'])
    emotes = parse_emotes(image_groups['emote'])
    bestshots = parse_bestshots(image_groups['bestshot'])
    cds = parse_cds()
    special_collections = parse_special_collections(image_groups)
    ancient_groups = parse_ancient_groups()

    return {
        'sourceUrls': [
            RECIPE_SOURCE_URL,
            BUILDING_SOURCE_URL,
            PLUSH_SOURCE_URL,
            CD_SOURCE_URL,
            BERRY_SOURCE_URL,
            EMOTE_SOURCE_URL,
            BESTSHOT_SOURCE_URL,
            MURAL_SOURCE_URL,
            SLATE_SOURCE_URL,
            ANCIENT_SOURCE_URL,
        ],
        'summary': {
            'recipeCount': len(shop_recipes) + len(other_recipes),
            'shopRecipeCount': len(shop_recipes),
            'otherRecipeCount': len(other_recipes),
            'buildingCount': len(buildings),
            'dollCount': len(dolls),
            'cdCount': len(cds),
            'berryCount': len(berries),
            'emoteCount': len(emotes),
            'bestshotCount': len(bestshots),
            'ancientItemCount': sum(group['count'] for group in ancient_groups),
            'notesKo': [
                '개별 CD 커버, 개별 인형 이미지, 개별 건물 키트 이미지는 안정 소스가 없어 텍스트 중심으로 정리했다',
                '정식 한국어 표기가 확인되지 않은 아이템명은 일본어 원문을 유지했다',
            ],
        },
        'recipes': {
            'shop': shop_recipes,
            'other': other_recipes,
        },
        'buildings': buildings,
        'dolls': dolls,
        'cds': cds,
        'berries': berries,
        'emotes': emotes,
        'bestshots': bestshots,
        'specialCollections': special_collections,
        'ancientItemGroups': ancient_groups,
    }


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main() -> None:
    site_data = load_site_data()
    material_map = load_material_map()
    image_groups = load_image_maps()
    pokemon_ko, label_ko = build_name_maps(site_data)

    dream_islands, dream_dolls, dream_summary = parse_dream_islands(pokemon_ko, material_map)
    dream_payload = {
        'sourceUrls': [DREAM_SOURCE_URL, PLUSH_SOURCE_URL],
        'summary': dream_summary,
        'islands': dream_islands,
        'dolls': dream_dolls,
        'notesKo': [
            '랜덤 인형 2종은 이미 가 본 꿈섬 중 하나로 연결된다',
            '전설 포켓몬은 지하층의 특수한 벽 뒤에서 저확률로 확인된다',
        ],
    }
    cooking_payload = parse_cooking(label_ko, pokemon_ko)
    items_payload = build_items_payload(label_ko, pokemon_ko, material_map, image_groups)

    write_json(OUTPUT_DIR / 'dream-data.json', dream_payload)
    write_json(OUTPUT_DIR / 'cooking-data.json', cooking_payload)
    write_json(OUTPUT_DIR / 'items-data.json', items_payload)

    print('Generated dream-data.json:', len(dream_payload['islands']), 'islands /', len(dream_payload['dolls']), 'dolls')
    print('Generated cooking-data.json:', len(cooking_payload['dishes']), 'dishes')
    print('Generated items-data.json:', items_payload['summary']['recipeCount'], 'recipes /', items_payload['summary']['ancientItemCount'], 'ancient items')


if __name__ == '__main__':
    main()
