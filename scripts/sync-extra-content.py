from __future__ import annotations

import csv
import hashlib
import json
import os
import re
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin

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
ITEM_PAGE = CACHE_DIR / 'image_match' / 'gamewith_items.html'
ITEM_FURNITURE_PAGE = CACHE_DIR / 'extra' / 'gamewith_items_furniture.html'
ITEM_MISC_PAGE = CACHE_DIR / 'extra' / 'gamewith_items_misc.html'
ITEM_OUTDOOR_PAGE = CACHE_DIR / 'extra' / 'gamewith_items_outdoor.html'
ITEM_UTILITY_PAGE = CACHE_DIR / 'extra' / 'gamewith_items_utility.html'
ITEM_BLOCKS_PAGE = CACHE_DIR / 'extra' / 'gamewith_items_blocks.html'
GAME8_ITEM_PAGE = CACHE_DIR / 'game8' / 'items.html'
GAME8_RECIPE_PAGE = CACHE_DIR / 'game8' / 'recipes.html'
GAME8_EMOTE_PAGE = CACHE_DIR / 'game8' / 'emotes.html'
GAME8_BESTSHOT_PAGE = CACHE_DIR / 'game8' / 'bestshots.html'
GAME8_CD_PAGE = CACHE_DIR / 'game8' / 'cds.html'
GAME8_ITEM_DETAIL_DIR = CACHE_DIR / 'game8' / 'item_details'
POKEAPI_ITEM_NAMES_FILE = CACHE_DIR / 'pokeapi' / 'item_names.csv'
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
MATERIAL_MANUAL_MAP_FILE = DATA_DIR / 'pokopia_habitat_material_manual_map_ko.csv'
GUIDE_TRANSLATION_MAP_FILE = DATA_DIR / 'pokopia_guide_translation_map_ko.csv'
EXTRA_TERM_MAP_FILE = DATA_DIR / 'pokopia_extra_content_manual_map_ko.csv'
FAVORITE_TAG_KO_FILE = DATA_DIR / 'pokopia_gamewith_favorite_tags_ko.csv'
FAVORITE_TAG_MASTER_FILE = DATA_DIR / 'gamewith_favorite_tags_master.csv'
FAVORITE_TAG_POKEMON_FILE = DATA_DIR / 'gamewith_pokemon_favorite_tags.csv'
FAVORITE_TAG_ITEM_FILE = DATA_DIR / 'gamewith_item_favorite_tags.csv'
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
GAME8_ITEM_SOURCE_URL = 'https://game8.jp/pocoapokemon/767406'
GAME8_RECIPE_SOURCE_URL = 'https://game8.jp/pocoapokemon/767405'
GAME8_EMOTE_SOURCE_URL = 'https://game8.jp/pocoapokemon/767794'
GAME8_BESTSHOT_SOURCE_URL = 'https://game8.jp/pocoapokemon/767514'
GAME8_CD_SOURCE_URL = 'https://game8.jp/pocoapokemon/767637'

MAP_KO = {
    'パサパサこうやの街': '메마른 황야 마을',
    'パサパサこうや': '메마른 황야',
    'パサパサ荒野': '메마른 황야',
    'ゴツゴツやまの街': '울퉁불퉁 산마을',
    'ゴツゴツやま': '울퉁불퉁 산',
    'ゴツゴツ山': '울퉁불퉁 산',
    'ドンヨリうみべの街': '우중충한 해변 마을',
    'ドンヨリうみべ': '우중충한 해변',
    'キラキラうきしまの街': '반짝반짝 부유섬 마을',
    'キラキラうきしま': '반짝반짝 부유섬',
    'まっさらな街': '빈 마을',
    'ゆめしま': '꿈섬',
    'どこでも': '어디서든',
    'コレクレーの館': '모으령의 관',
}

DREAM_ISLAND_KO = {
    'こうやのゆめしま': '황야 꿈섬',
    'いわやまのゆめしま': '바위산 꿈섬',
    'かざんのゆめしま': '화산 꿈섬',
    'うなばらのゆめしま': '바다 꿈섬',
    'そらのゆめしま': '하늘 꿈섬',
    'ランダム': '랜덤',
}


def load_extra_term_map() -> dict[str, str]:
    if not EXTRA_TERM_MAP_FILE.exists():
        return {}

    mapping: dict[str, str] = {}
    with EXTRA_TERM_MAP_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            key = row.get('key_jp', '').strip()
            value = row.get('value_ko', '').strip()
            if key and value:
                mapping[key] = value
    return mapping


EXTRA_TERM_KO = load_extra_term_map()


def load_guide_term_map() -> dict[str, str]:
    if not GUIDE_TRANSLATION_MAP_FILE.exists():
        return {}

    mapping: dict[str, str] = {}
    with GUIDE_TRANSLATION_MAP_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            key = (row.get('key_jp') or '').strip()
            value = (row.get('value_ko') or '').strip()
            if key and value:
                mapping[key] = value
    return mapping


GUIDE_TERM_KO = load_guide_term_map()


def load_favorite_tag_translation_map() -> dict[str, dict[str, str]]:
    if not FAVORITE_TAG_KO_FILE.exists():
        return {}

    mapping: dict[str, dict[str, str]] = {}
    with FAVORITE_TAG_KO_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            tag_id = (row.get('tag_id') or '').strip()
            name_ko = (row.get('tag_label_ko') or '').strip()
            if not tag_id or not name_ko:
                continue

            mapping[tag_id] = {
                'nameKo': name_ko,
                'translationStatus': (row.get('translation_status') or 'manual').strip() or 'manual',
            }
    return mapping


FAVORITE_TAG_TRANSLATIONS = load_favorite_tag_translation_map()


def load_official_item_name_map() -> dict[str, str]:
    if not POKEAPI_ITEM_NAMES_FILE.exists():
        return {}

    by_id: dict[str, dict[str, str]] = {}
    with POKEAPI_ITEM_NAMES_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            item_id = row.get('item_id', '').strip()
            language_id = row.get('local_language_id', '').strip()
            name = row.get('name', '').strip()
            if not item_id or not name:
                continue

            if language_id == '1':
                by_id.setdefault(item_id, {})['jp'] = name
            elif language_id == '3':
                by_id.setdefault(item_id, {})['ko'] = name

    return {
        names['jp']: names['ko']
        for names in by_id.values()
        if names.get('jp') and names.get('ko')
    }


OFFICIAL_ITEM_KO = load_official_item_name_map()

MANUAL_KO = {
    'ピッピにんぎょう': '삐삐 인형',
    'みがわりにんぎょう': '대타 인형',
    'メタモンにんぎょう': '메타몽 인형',
    'ヒメリのみ': '과사열매',
    'ラムのみ': '리샘열매',
    'モモンのみ': '복슝열매',
    'ナナシのみ': '배리열매',
    'カゴのみ': '유루열매',
    'チーゴのみ': '복분열매',
    'つたひも': '덩굴끈',
    'ひかるキノコ': '빛나는 버섯',
    'たべごろキノコ': '먹음직한 버섯',
    'どう': '구리',
    'せっかいせき': '석회석',
    'てつ': '철',
    'きん': '금',
    'ヒカリいし': '빛의돌',
    'いとくず': '실오라기',
    'シーグラスのかけら': '씨글라스 조각',
    'かいがら': '조개껍질',
    'クリスタルのカケラ': '크리스털 조각',
    'かみのゴミ': '종이 쓰레기',
    'ポケメタル': '포케메탈',
    'レアポケメタルのかけら': '레어 포케메탈 조각',
    'かいそう': '해초',
    'たべごろニンジン': '먹음직한 당근',
    'トマト': '토마토',
    'コムギ': '밀',
    'マメ': '콩',
    'ジャガイモ': '감자',
    'はっぱ': '잎사귀',
    'おいしいみず': '맛있는 물',
    'なんでも': '아무거나',
    'なんでも×2': '아무거나×2',
    'サラダ(なんでも)': '샐러드(아무거나)',
    'スープ(なんでも)': '수프(아무거나)',
    'パン(なんでも)': '빵(아무거나)',
    'ハンバーグ(なんでも)': '햄버그(아무거나)',
    'はっぱなど(他の料理にならないならなんでも)': '잎사귀 등(다른 요리가 되지 않으면 아무거나)',
    'はっぱなど(他の料理にならないならなんでも)×2': '잎사귀 등(다른 요리가 되지 않으면 아무거나)×2',
    'はっぱなど(他の料理にならないならなんでも)×3': '잎사귀 등(다른 요리가 되지 않으면 아무거나)×3',
    'まないた': '도마',
    'フライパン': '프라이팬',
    'なべ': '냄비',
    'パンがま': '빵가마',
    'サラダ': '샐러드',
    'ハンバーグ': '햄버그',
    'スープ': '수프',
    'パン': '빵',
    '建物': '건물',
    '家': '집',
    'キット': '키트',
    'ざっか': '잡화',
    '家具': '가구',
    'おくがい': '야외',
    '便利': '편의',
    'べんり': '편의',
    'ブロック': '블록',
    '食べもの': '음식',
    'その他': '기타',
    'そのた': '기타',
    'ざっか': '잡화',
    'たてもの': '건물',
    '材料': '재료',
    '大切なもの': '중요한 것',
    'コレクション外': '컬렉션 외',
    '自然': '자연',
    '普通': '보통',
    'あまい': '달콤함',
    'からい': '매콤함',
    'しぶい': '떫은맛',
    'すっぱい': '새콤함',
    'にがい': '쌉쌀함',
    'アツアツスープパン': '뜨끈뜨끈 수프빵',
    'オープニング': '오프닝',
    '戦い(VSジムリーダー)': '전투! 체육관 관장',
    '戦い（VSジムリーダー）': '전투! 체육관 관장',
    'ヒマワキシティ': '검방울시티',
    '209ばんどうろ(昼)': '209번도로(낮)',
    '209ばんどうろ（昼）': '209번도로(낮)',
    'テンガンざん': '천관산',
    'ハウオリシティ(昼)': '하우올리시티(낮)',
    'ハウオリシティ（昼）': '하우올리시티(낮)',
    'いろどりハンバーグ': '알록달록 햄버그',
    'おとなのハンバーグ': '어른의 햄버그',
    'かいそうサラダ': '해초 샐러드',
    'かいそうスープ': '해초 수프',
    'きのこハンバーグ': '버섯 햄버그',
    'キノコスープ': '버섯 수프',
    'キャロットパン': '캐럿 빵',
    'クルトンサラダ': '크루통 샐러드',
    'ジャガイモハンバーグ': '감자 햄버그',
    'ジューシースープ': '쥬시 수프',
    'すりつぶしサラダ': '으깬 샐러드',
    'せんぎりサラダ': '채썬 샐러드',
    'トマトハンバーグ': '토마토 햄버그',
    'ヒメリサラダ': '히메리 샐러드',
    'ヒメリパン': '히메리 빵',
    'ビリビリスープ': '찌릿찌릿 수프',
    'ふわふわパン': '폭신폭신 빵',
    'プレーンサラダ': '플레인 샐러드',
    'プレーンパン': '플레인 빵',
    'プレーンハンバーグ': '플레인 햄버그',
    'プレーンスープ': '플레인 수프',
    'やくぜんスープ': '약선 수프',
    'リメイクパン': '리메이크 빵',
    'おおきなおとしもの': '큰 떨어진 물건',
    'ちいさなおとしもの': '작은 떨어진 물건',
    'かせき': '화석',
    'きんのたま': '금구슬',
    'ぎんのおうかん': '은왕관',
    'きんのおうかん': '금왕관',
    'きちょうなホネ': '귀중한뼈',
    'ハートのウロコ': '하트비늘',
    'きせきのタネ': '기적의씨',
    'かたいいし': '단단한돌',
    'しんぴのしずく': '신비의물방울',
    'メタルコート': '메탈코트',
    'まがったスプーン': '휘어진스푼',
    'ぎんのこな': '은빛가루',
    'くろいメガネ': '검은안경',
    'くろおび': '검은띠',
    'シルクのスカーフ': '실크스카프',
    'するどいくちばし': '예리한부리',
    'どくバリ': '독바늘',
    'とけないこおり': '녹지않는얼음',
    'のろいのおふだ': '저주의부적',
    'もくたん': '목탄',
    'やわらかいすな': '부드러운모래',
    'ようせいのハネ': '요정의깃털',
    'りゅうのキバ': '용의이빨',
    'たべのこし': '먹다남은음식',
    'くろいヘドロ': '검은진흙',
    'しあわせタマゴ': '행복의알',
    'あかいいと': '빨간실',
    'いのちのたま': '생명의구슬',
    'くろいてっきゅう': '검은철구',
    'メタルパウダー': '메탈파우더',
    'おおきなねっこ': '굵은뿌리',
    'ビビリだま': '비비리구슬',
    'じゃくてんほけん': '약점보험',
    'グランドコート': '그랜드코트',
    'こうかくレンズ': '광각렌즈',
    'のどスプレー': '목스프레이',
    'ひかりのねんど': '빛점토',
    'いかさまダイス': '속임수주사위',
    'くっつきバリ': '달라붙는바늘',
    'せんせいのツメ': '선공의손톱',
    'こうこうのしっぽ': '느림보꼬리',
    'かえんだま': '화염구슬',
    'とくせいガード': '특성가드',
    'ルームサービス': '룸서비스',
    'ねらいのまと': '표적',
    'クリアチャーム': '클리어참',
    'フォーカスレンズ': '포커스렌즈',
    'ズガイのカセキ': '두개골 화석',
    'たてのカセキ': '방패 화석',
    'アゴのカセキ': '턱 화석',
    'ヒレのカセキ': '지느러미 화석',
    'ツバサのカセキ': '날개 화석',
    'ずつきのカセキ': '박치기 화석',
    'シールドのカセキ': '실드 화석',
    'ぼうくんのカセキ': '폭군 화석',
    'ツンドラのカセキ': '툰드라 화석',
    'かくばりたな': '모서리 선반',
    'なぞのだいざ': '수수께끼 받침대',
    'クレベーステーブル': '크레베이스 테이블',
    'ピカチュウソファ': '피카츄 소파',
    'いねむりベッド': '선잠 침대',
    'ぐにゃぐにゃかがみ': '흐물흐물 거울',
    'ツボかびん': '항아리 화병',
    'ムンナちょきんばこ': '몽나 저금통',
    'ぴょんぴょんバスタブ': '깡충깡충 욕조',
    'アーケードゲームマシン': '아케이드 게임기',
    'あやしいディフューザー': '수상한 디퓨저',
    'きんのいれば': '금니',
    'むしよけスプレー': '벌레퇴치 스프레이',
    'でかいきんのたま': '큰 금구슬',
    'びっくりばこ': '깜짝상자',
    'おきあがりソーナンス': '오뚝이 마자용',
    'なぞのせきぞう': '수수께끼 석상',
    'ほのおのブビィぞう': '불꽃 마그비 석상',
    'ジムマークぞう': '짐마크 석상',
    'うちゅうふく': '우주복',
    'スペースシャトルのもけい': '우주왕복선 모형',
    'うちゅうせん': '우주선',
    'モクローどけい': '나몰빼미 시계',
    'てるてるポワルン': '테루테루 포와룬',
    'あやしいキャンドル': '수상한 캔들',
    'ガーデンオーナメント': '가든 오너먼트',
    'じてんしゃ': '자전거',
    'タッツーふんすい': '쏘드라 분수',
    'つりざお': '낚싯대',
    'ライチュウかんばん': '라이츄 간판',
    'プチ図書館': '미니 도서관',
    'ピカチュウスペース': '피카츄 스페이스',
    'ラッキー休けい所': '럭키 휴게소',
    'たきび': '모닥불',
    'ちいさなまるた': '작은 통나무',
    'ざいもく': '재목',
    'ゴミばこ': '쓰레기통',
    'てんじだい': '전시대',
    'くさのカベかざり': '풀 벽장식',
    'キノコのがいとう': '버섯 가로등',
    'ビッグしゅうのうボックス': '빅 수납박스',
    'キャンバス': '캔버스',
    'スプリンクラー': '스프링클러',
    'オシャレななべ': '세련된 냄비',
    'デカヌギア': '두드리짱',
    'レアポケメタル': '레어 포케메탈',
    'ポケメタルのかけら': '포케메탈 조각',
    'レアポケメタルのかけら': '레어 포케메탈 조각',
    'かみ': '종이',
    'もえないゴミ': '불연성 쓰레기',
    'わた': '솜',
    'たいまつ': '횃불',
    'わたげ': '솜털',
    'かおだしパネル': '얼굴내밀기 패널',
    'ながれぼしランプ': '별똥별 램프',
    'タネボーランプ': '도토링 램프',
    'ヤドンのラグ': '야돈 러그',
    'リザードンのラグ': '리자몽 러그',
    'タウンマップ': '타운 맵',
    'ロケットだんのかべかけ': '로켓단 벽걸이',
    'ともしびのさいだんキット': '등불 제단 키트',
    'はっぱのおへやキット': '잎사귀 방 키트',
    'はっぱのりっぱなキット': '잎사귀 큰집 키트',
    '風力はつでんキット': '풍력발전 키트',
    'ふたごのひむろキット': '쌍둥이 빙실 키트',
    'むじんはつでんしょキット': '무인 발전소 키트',
    '木のけんざいレシピセット': '나무 건자재 레시피 세트',
    'こうやのいえづくりレシピセット': '황야 집짓기 레시피 세트',
    'やねがわらレシピセット': '지붕 기와 레시피 세트',
    '木のふちのレシピセット': '나무 테두리 레시피 세트',
    'うきしまのいえづくりレシピセット': '부유섬 집짓기 레시피 세트',
    'やまのいえづくりレシピセット': '산 집짓기 레시피 세트',
    'コンクリのふちのレシピセット': '콘크리트 테두리 레시피 세트',
    'ごうかなはしらレシピセット': '화려한 기둥 레시피 세트',
    'どうののべぼう': '구리 주괴',
    'きんののべぼう': '금 주괴',
    'てつののべぼう': '철 주괴',
    'マグマいわ': '마그마 바위',
    'じょうぶなえだ': '튼튼한 가지',
    'こおり': '얼음',
    'ふしぎなげん': '수수께끼 현',
    'ヨロイのはへん': '갑옷 파편',
    'ぐにゃぐにゃねんど': '흐물흐물 점토',
    'さんばし': '부두',
    'うみなりのスズ': '바다울림 방울',
    'とうめいなスズ': '투명 방울',
    'かざぐるま': '바람개비',
    'しゅうのうボックス': '수납 박스',
    'ビッグしゅうのうボックス': '빅 수납 박스',
    'バスケット': '바구니',
    'おおきなかがみ': '큰 거울',
    'ボロい木ばこ': '낡은 나무 상자',
    'メタモンのはた': '메타몽 깃발',
    'コンクリートミキサー': '콘크리트 믹서',
    'ごうかなはしら・した': '화려한 기둥 · 아래',
    'ごうかなはしら・まんなか': '화려한 기둥 · 중간',
    'ごうかなはしら・うえ': '화려한 기둥 · 위',
    'タイルカーペット': '타일 카펫',
    'イワイノヨロイ': '축복의 갑옷',
    'ノロイノヨロイ': '저주의 갑옷',
    'ミラーボール': '미러볼',
    'おうぎやね': '부채 지붕',
    'リース': '리스',
    'はなびだま': '불꽃구슬',
    'オフィスのキャビネット': '오피스 캐비닛',
    'CDプレーヤーのレシピ': 'CD 플레이어 레시피',
    'CDラックのレシピ': 'CD 랙 레시피',
    'うみべのいえづくりレシピセット': '해변 집짓기 레시피 세트',
    'ポケセンたてなおしキット': '포켓몬센터 재건 키트',
    'メタモンラグのレシピ': '메타몽 러그 레시피',
    'じどうドア': '자동문',
    'アンティークソファ': '앤티크 소파',
    'アンティークチェスト': '앤티크 체스트',
    'ひびわれすないわ': '금 간 모래바위',
    'アンティークシャンデリア': '앤티크 샹들리에',
    'ポールさんかくコーン': '폴 삼각 콘',
    'パンチングマシーン': '펀칭머신',
    'おそうじセット': '청소 세트',
    'ラッキーのうえ木': '럭키 장식 나무',
    'さんばしのいた': '부두 판자',
    'ナチュラルなだい': '내추럴 받침대',
    'スプリンクラー': '스프링클러',
    'イカしたエレキベース': '멋진 일렉트릭 베이스',
    'イカしたエレキギター': '멋진 일렉트릭 기타',
    'ポップなイスのレシピ': '팝 의자 레시피',
    'あげさげまどのレシピ': '여닫이 창문 레시피',
    'やねのレシピセット': '지붕 레시피 세트',
    'おかたづけをしようを作るヒント': '정리 정돈을 하자 제작 힌트',
    'いしやねのレシピ': '돌 지붕 레시피',
    'おおきな木のドア': '큰 나무 문',
    'いしづみのカベ': '돌담 벽',
    'やねがわらのかざり': '지붕 기와 장식',
    'がくぶち': '액자',
    'ツルツルのひよけ': '매끈한 차양',
    'ポケセンのカウンター': '포켓몬센터 카운터',
    'おしゃれなてつのカベ': '세련된 철 벽',
    'なぞのへきが': '수수께끼 벽화',
    'なぞのせきばん': '수수께끼 석판',
    'いにしえのもの': '고대의 물건',
    '各種CD': '각종 CD',
    'ニンゲンのきろく': '인간의 기록',
    '～オープニング～': '오프닝',
    'マサラタウンのテーマ': '마사라타운의 테마',
    'オーキド研究所': '오키드 연구소',
    'トキワへの道': '토키와로 가는 길',
    'ニビシティのテーマ': '니비시티의 테마',
    'ポケモンセンター': '포켓몬센터',
    'おつきみ山のどうくつ': '달맞이산 동굴',
    'ハナダへの道': '하나다로 가는 길',
    'セキチクシティのテーマ': '세키치쿠시티의 테마',
    'ポケモンジム': '포켓몬짐',
    'マサキのもとへ': '마사키에게',
    'クチバシティのテーマ': '쿠치바시티의 테마',
    'サントアンヌ号': '산토안느호',
    'ロケット団アジト': '로켓단 아지트',
    'シルフカンパニー': '실프컴퍼니',
    '戦い(VSジムリーダー)': '배틀(VS 짐리더)',
    'つながりのどうくつ': '이어진 동굴',
    'エンジュシティ': '엔주시티',
    'スズのとう': '방울탑',
    'ヒワマキシティ': '히와마키시티',
    'ルネシティ': '루네시티',
    '209ばんどうろ(昼)': '209번도로(낮)',
    'テンガンさん': '텐간산',
    'ゲームコーナー': '게임코너',
    'ホドモエシティ': '호도모에시티',
    '10番道路': '10번도로',
    'グッズでドレスアップ！': '굿즈로 드레스업!',
    'エイセツシティ': '에이세츠시티',
    'ブティック': '부티크',
    'スーパートレーニング！': '슈퍼트레이닝!',
    'コンテストライブ！': '콘테스트 라이브!',
    'ハウオリシティ(昼)': '하우올리시티(낮)',
    'エーテルパラダイス': '에테르파라다이스',
    'ウルトラビルディング': '울트라빌딩',
    'ワイルドエリア・北': '와일드에리어 · 북부',
    'シュートシティ': '슈트시티',
    'ローズタワー': '로즈타워',
    '戦闘！ジムリーダー・1': '배틀! 짐리더 · 1',
    'コトブキムラ': '코토부키마을',
    '南エリア': '남부 에리어',
    'アカデミー': '아카데미',
    'エリアゼロ': '에리어 제로',
    '戦闘！ジムリーダー・2': '배틀! 짐리더 · 2',
    'CD': 'CD',
}

NAME_TOKEN_KO = {
    'レシピセット': '레시피 세트',
    'クラフトだい': '제작대',
    'レシピ': '레시피',
    'を作るヒント': ' 제작 힌트',
    'キット': '키트',
    '木の': '나무 ',
    '木': '나무 ',
    'いえの': '집 ',
    'ふねの': '배 ',
    'きのみな': '열매 ',
    'シンプルな': '심플한 ',
    'ナチュラルな': '내추럴한 ',
    'ポップな': '팝 ',
    'モダンな': '모던 ',
    'インダストリアルな': '인더스트리얼 ',
    'メタルな': '메탈 ',
    'アンティーク': '앤티크 ',
    'フレームガラス': '프레임 유리 ',
    'ガラス': '유리 ',
    'フタつき': '뚜껑 달린 ',
    'モザイク': '모자이크 ',
    'みずたまもよう': '물방울무늬',
    'アスファルト': '아스팔트 ',
    'うちっぱなし': '노출 콘크리트 ',
    'でっぱりの': '돌출 ',
    'でっぱり': '돌출 ',
    'ひっこみの': '오목한 ',
    'たいらな': '평평한 ',
    'デコボコ': '울퉁불퉁 ',
    'ざらざら': '거친 ',
    'ツルツル': '매끈한 ',
    'ななめの': '대각선 ',
    'いえづくり': '집짓기',
    'けんざい': '건자재',
    'しきり': '칸막이',
    'やねがわら': '지붕 기와',
    'カベかけ': '벽걸이 ',
    'かべかけ': '벽걸이 ',
    'かがみ': '거울',
    'ゆかつき': '바닥형 ',
    'ガーデン': '가든 ',
    'ライト': '라이트',
    'イス': '의자',
    'チェア': '의자',
    'ベンチ': '벤치',
    'テーブル': '테이블',
    'ランタン': '랜턴',
    'ランプ': '램프',
    'つりさげ': '매달린 ',
    'ラグ': '러그',
    'ソファ': '소파',
    'ベッド': '침대',
    'クローゼット': '클로젯',
    'ドレッサー': '화장대',
    'チェスト': '체스트',
    'スイッチ': '스위치',
    'センサー': '센서',
    'ポール': '폴',
    'プレーヤー': '플레이어',
    'ラック': '랙',
    'フラワー': '플라워',
    'ランプ': '램프',
    'ななめ': '대각선 ',
    'ペンキぬり': '페인트칠 ',
    'インダストリアル': '인더스트리얼 ',
    'おしゃれ': '세련된 ',
    'ふみいし': '디딤돌',
    'だいりせき': '대리석',
    'ダーク': '다크',
    'コンクリ': '콘크리트',
    'コンクリート': '콘크리트',
    'みなと': '항구',
    'うみべ': '해변',
    'かなあみ': '철망',
    'モダン': '모던 ',
    'しっくい': '회반죽 ',
    'ポケセン': '포켓몬센터',
    'たてなおし': '재건',
    'ゲームボーイ': '게임보이',
    'クラッカー': '크래커',
    'れいぞうこ': '냉장고',
    'せんたくき': '세탁기',
    'メタル': '메탈 ',
    'ようこうろ': '용광로',
    'レジ': '계산대',
    'ステージだい': '무대',
    'おさら': '접시',
    'パーティー': '파티 ',
    'プレート': '플레이트',
    'カベかざり': '벽장식',
    'ごうかな': '화려한 ',
    'はしら': '기둥',
    'うきしま': '부유섬',
    'こうや': '황야',
    'やま': '산',
    'いし': '돌',
    'ふた': '뚜껑',
    'ドア': '문',
    'カベ': '벽',
    'ゆか': '바닥',
    'まど': '창문',
    'かいだん': '계단',
    'ハシゴ': '사다리',
    'アーチ': '아치 ',
    'タイル': '타일',
    'つみあげ': '쌓은 ',
    'わら': '건초',
    'きのみいり': '열매가 든 ',
    'バスケット': '바구니',
    'みんなの': '모두의 ',
    'ボックス': '박스',
    'はしご': '사다리',
    'ふち': '테두리',
    'さく': '울타리',
    'ついたて': '칸막이',
    'トビラ': '문',
    'みち': '길',
    'いた': '판자',
    'はた': '깃발',
    'ポップ': '팝 ',
    'ミニ': '미니 ',
    'はつでんマシン': '발전 머신',
    'ろっかくけい': '육각형',
    'ふね': '배',
    'レンガ': '벽돌',
    'アーケードゲームマシン': '아케이드 게임기',
    'オーナメント': '오너먼트',
    'バスタブ': '욕조',
    'スプレー': '스프레이',
    'パネル': '패널',
    'どけい': '시계',
    'もけい': '모형',
    'カウンター': '카운터',
    'カーペット': '카펫',
    'ふんすい': '분수',
    'じてんしゃ': '자전거',
    'かんばん': '간판',
    'タマゴ': '알',
    'てっきゅう': '철구',
    'パウダー': '파우더',
    'ねっこ': '뿌리',
    'ほけん': '보험',
    'レンズ': '렌즈',
    'ねんど': '점토',
    'ダイス': '주사위',
    'バリ': '바늘',
    'ツメ': '손톱',
    'しっぽ': '꼬리',
    'ガード': '가드',
    'サービス': '서비스',
    'チャーム': '참',
    'まと': '표적',
    'まっすぐ': '직선',
    'かど': '모서리',
    'した': '아래',
    'まんなか': '중간',
    'うえ': '위',
    'カセキ': '화석',
    '・あたま': ' · 머리',
    '・どう': ' · 몸통',
    '・しっぽ': ' · 꼬리',
    '・うよく': ' · 오른쪽 날개',
    '・さよく': ' · 왼쪽 날개',
    '・あし': ' · 다리',
}

PLACE_REPLACEMENTS = {
    'その他 飾り物としてフィールドに置く': '기타 장식물로 필드에 놓기',
    'その他 家具としてフィールドに置く': '기타 가구로 필드에 놓기',
    'その他 フワンテに見せるとゆめしまに行ける': '기타 흔들풍손에게 보여주면 꿈섬에 갈 수 있다',
    '食べるとPPを回復する': '먹으면 PP를 회복한다',
    '畑に水をやる': '밭에 물을 준다',
    'すみかで使うとポケモンが帰ってくる': '거처에서 사용하면 포켓몬이 돌아온다',
    '溶鉱炉でもやすと銅ののべぼうになる': '용광로에 넣으면 구리 주괴가 된다',
    '溶鉱炉でもやすと鉄ののべぼうになる': '용광로에 넣으면 철 주괴가 된다',
    '溶鉱炉でもやすと金ののべぼうになる': '용광로에 넣으면 금 주괴가 된다',
    '溶鉱炉でもやすとレアポケメタルになる。': '용광로에 넣으면 레어 포케메탈이 된다.',
    'ゴツゴツやまのポケセン復興などの建設で必要になる': '울퉁불퉁 산 포켓몬센터 복구 등 건설에 필요하다',
    '様々なクラフトに使う他、入団チャレンジ3つ目に必要。': '다양한 제작에 쓰이며 입단 챌린지 3번째에도 필요하다.',
    '様々なクラフトに使う他、入団チャレンジやポケセンの復興に使用。': '다양한 제작에 쓰이며 입단 챌린지와 포켓몬센터 복구에도 사용된다.',
    '様々なクラフトに使う他、入団チャレンジやビルの建て直しに使用。': '다양한 제작에 쓰이며 입단 챌린지와 건물 재건에도 사용된다.',
    'ルギア、ホウオウを入手するためのスズ作成に必要。写真からアイテムの複製にも使える。': '루기아와 칠색조를 얻기 위한 방울 제작에 필요하다. 사진으로 아이템을 복제할 때도 쓴다.',
    'ホウオウを入手するためのスズ作成に必要。コレクレーに渡すと珍しいアイテムがもらえる。': '칠색조를 얻기 위한 방울 제작에 필요하다. 모으령에게 주면 희귀한 아이템을 받을 수 있다.',
    'ルギアを入手するためのスズ作成に必要。コレクレーに渡すと珍しいアイテムがもらえる。': '루기아를 얻기 위한 방울 제작에 필요하다. 모으령에게 주면 희귀한 아이템을 받을 수 있다.',
    '入団チャレンジ7つ目で必要。': '입단 챌린지 7번째에 필요하다.',
    '入団チャレンジ5つ目で必要。': '입단 챌린지 5번째에 필요하다.',
    '様々なクラフトや建設に使用。': '다양한 제작과 건설에 사용된다.',
    'ポケメタルになる。': '포케메탈이 된다.',
    '「イワイノヨロイ」「ノロイノヨロイ」のクラフトに使う': '축복받은갑옷과 저주받은갑옷 제작에 사용된다.',
    '「イカしたエレキギター」「イカしたエレキベース」のクラフトに使う': '멋진 일렉기타와 멋진 일렉베이스 제작에 사용된다.',
    'ゴミポケモンなどでリサイクルすると紙になる。': '깨봉이 같은 쓰레기 포켓몬으로 재활용하면 종이가 된다.',
    'そこらへんに落ちてるゴミ。一部ポケモンは好むらしい。': '여기저기 떨어져 있는 쓰레기다. 일부 포켓몬이 좋아하는 듯하다.',
    '砂浜に落ちているただの貝がら。家を作る材料にもなる。': '모래사장에 떨어진 평범한 조개껍질이다. 집을 만드는 재료로도 쓴다.',
    '自分の街にきた他プレイヤーのポケモンに渡すとおみやげと交換することができる。': '내 마을에 온 다른 플레이어 포켓몬에게 주면 기념품과 교환할 수 있다.',
    '食べるとくさかりが強化される': '먹으면 풀베기가 강화된다',
    'イベントで使用': '이벤트에 사용',
    '木かげでぐっすりカビゴン': '나무그늘에서 쿨쿨 잠만보',
    'ピカチュウスペース': '피카츄 스페이스',
    'ラッキー休けい所': '럭키 휴게소',
    'ちいさなおとしもの 初回鑑定時': '작은 떨어진 물건 첫 감정 시',
    'おおきなおとしもの 初回鑑定時': '큰 떨어진 물건 첫 감정 시',
    'ちいさなおとしもの': '작은 떨어진 물건',
    'おおきなおとしもの': '큰 떨어진 물건',
    'ショップ': '상점',
    'ショップ で': '상점에서 ',
    '購入': '구매',
    'コイン': '코인',
    'ショップで購入': '상점 구매',
    'ショップでレシピを購入': '상점에서 레시피 구매',
    'ショップで': '상점에서 ',
    'ショップ 解放': '상점 해금',
    '環境レベル': '환경 레벨 ',
    'で拾う': '에서 줍기',
    'で入手': '에서 획득',
    'で解放': '에서 해금',
    '入手した際に入手': '획득했을 때 획득',
    '入手時に解放': '획득 시 해금',
    '入手時にひらめく': '획득 시 영감',
    'を入手するとひらめく': '을 획득하면 영감',
    '日替わり': '일일 교체',
    'ストーリーでクラフト台解放時に入手': '스토리에서 제작대 해금 시 획득',
    'ストーリーで': '스토리 진행으로 ',
    'のストーリー中に入手': ' 스토리 중 획득',
    'のストーリーで入手': ' 스토리 진행으로 획득',
    'のストーリークリア後': ' 스토리 클리어 후',
    'に話しかけて入手': '에게 말을 걸어 획득',
    'と会話したときにもらう': '와 대화했을 때 획득',
    'を友達にすると解放': '를 친구로 만들면 해금',
    'のおねがいごと': '의 부탁',
    'を初めて入手したとき': '를 처음 획득했을 때',
    'を入手する': ' 획득',
    'を入手': ' 획득',
    'を作成': ' 제작',
    'を購入': ' 구매',
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
    'ベッドを使ってもらおう': '침대를 사용하게 해 주자',
    'ストーリーで フシギダネ のおねがい「ベッドを使ってもらおう」で入手': '스토리 진행으로 이상해씨의 부탁 "침대를 사용하게 해 주자"에서 획득',
    'ストーリーで ヤドン と会話したときにもらう': '스토리 진행으로 야돈과 대화했을 때 획득',
    'ローブシン に話しかけて入手': '노보청에게 말을 걸어 획득',
    'コンクリート を入手するとひらめく': '콘크리트를 획득하면 영감',
    'ファイヤー 、 サンダー 、 フリーザー を友達にすると解放': '파이어, 썬더, 프리져를 친구로 만들면 해금',
    'ライコウ 、 エンテイ 、 スイクン を友達にすると解放': '라이코, 앤테이, 스이쿤을 친구로 만들면 해금',
    'ニョロボン のおねがいごとを2回クリアで入手': '강챙이의 부탁을 2번 클리어하면 획득',
    'はたを自宅に設置後に解放': '깃발을 집에 설치한 뒤 해금',
    'ファイヤーの生息地を作れる': '파이어 서식지를 만들 수 있다',
    'ファイヤー の生息地を作れる': '파이어 서식지를 만들 수 있다',
    'フリーザーの生息地を作れる': '프리져 서식지를 만들 수 있다',
    'フリーザー の生息地を作れる': '프리져 서식지를 만들 수 있다',
    'サンダーの生息地を作れる': '썬더 서식지를 만들 수 있다',
    'サンダー の生息地を作れる': '썬더 서식지를 만들 수 있다',
    'メタモンやポケモンのすみかになる': '메타몽과 포켓몬의 거처가 된다',
    'メタモン やポケモンのすみかになる': '메타몽과 포켓몬의 거처가 된다',
    'みんなで暮らせる特大の家が目標だ。ポケモンたちと一緒に「けんちく」しよう。': '모두 함께 살 수 있는 특대형 집이 목표다. 포켓몬과 함께 건축하자.',
    '風の力でいつでも「はつでん」できる。ポケモンたちと一緒に「けんちく」しよう。': '바람의 힘으로 언제든 발전할 수 있다. 포켓몬과 함께 건축하자.',
    '最初から所持': '처음부터 소지',
    'ポケモンセンターから北側': '포켓몬센터 북쪽',
    '東側にあるゲート付近': '동쪽 게이트 근처',
    '近く': '근처',
    '隣': '옆',
    '▶得意なこと一覧': '',
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
    'たき火でポカポカ': '모닥불 주변에서 자고 있는 포켓몬을 촬영',
    'たき火でぽかぽか': '모닥불 주변에서 자고 있는 포켓몬을 촬영',
    'かぜおこしで回せ': '바람개비 근처에 있는 구구를 촬영',
    'うなるマッハのこぶし': '샌드백으로 연습하는 홍수몬을 촬영',
    '大きなねどこで仲良くグッスリ': '나무 침대에서 함께 자는 포켓몬 2마리를 촬영',
    '水浴びサイコー！': '샤워 중인 포켓몬을 촬영',
}

BESTSHOT_NAME_KO = {
    'たき火でポカポカ': '모닥불로 포근포근',
    'かぜおこしで回せ': '바람일으키기로 돌려라',
    'うなるマッハのこぶし': '울리는 마하의 주먹',
    '大きなねどこで仲良くグッスリ': '큰 잠자리에서 사이좋게 쿨쿨',
    'ゴミのごちそう見ーつけた？': '쓰레기 만찬 찾았니?',
    '水浴びサイコー！': '물놀이 최고!',
    '頭のお花が満開': '머리 위 꽃이 만개',
}

BESTSHOT_REWARD_KO = {
    'フォトフレーム「ほのおのうず」': '포토프레임 불꽃소용돌이',
    'フォトフレーム「ほのおのうず」を入手': '포토프레임 불꽃소용돌이 획득',
    'フォトフレーム「しょうげきは」': '포토프레임 충격파',
    'フォトフレーム「しょうげきは」を入手': '포토프레임 충격파 획득',
    'フォトフレーム「バブル」': '포토프레임 버블',
    'フォトフレーム「バブル」を入手': '포토프레임 버블 획득',
    'フォトフレーム「ドドーン！」': '포토프레임 두둥!',
    'なし': '없음',
}

SPECIAL_COLLECTION_NOTE_KO = {
    'なぞのへきが': '메마른 황야 포켓몬센터 뒤쪽 숨은 방에서 확인할 수 있는 벽화. 석판을 모두 맞추면 뮤가 출현한다.',
    'なぞのせきばん': '빛나는 땅을 파서 모으는 수집품. 벽화 슬롯 27칸에 맞는 언노운 형태를 끼워 넣는다.',
}

ITEM_USE_LABEL_KO = {
    '生息地': '서식지',
    'その他': '기타',
    'ニンゲンのきろく': '인간의 기록',
    'ベストショット': '베스트샷',
    'エモート': '감정표현',
    'マップ名': '맵',
    '詳細': '상세',
    '報酬': '보상',
    'ポケモン': '포켓몬',
    'アイテム': '아이템',
    'なし': '없음',
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
EXTRA_BUILDING_ITEM_TYPES = {
    'あみものキット': '키트',
    '風力はつでんマシン': '설비',
    '水力はつでんマシン': '설비',
    '火力はつでんマシン': '설비',
}
DREAM_ISLAND_NAMES = ['こうやのゆめしま', 'いわやまのゆめしま', 'かざんのゆめしま', 'うなばらのゆめしま', 'そらのゆめしま']

CATEGORY_BY_FLAG = {
    'i1': '家具',
    'i2': 'ざっか',
    'i3': 'おくがい',
    'i4': 'べんり',
    'i5': 'たてもの',
    'i6': 'ブロック',
    'i7': 'キット',
    'i8': '自然',
    'i9': '食べもの',
    'i10': '材料',
    'i11': '大切なもの',
    'i12': 'コレクション外',
    'ot': 'その他',
}

ITEM_NAME_ALIASES = {
    'かがみ（大きなもの）': 'おおきなかがみ',
    'てるてるポワルン（晴れ）': 'てるてるポワルン',
    'パーティプレート': 'パーティープレート',
    'やねがわらのレシピセット': 'やねがわらレシピセット',
    'ゲーミングヘッド': 'ゲーミングベッド',
}

RECIPE_IMAGE_ALIASES = {
    'やねがわらのレシピセット': ['やねがわらのかざり', 'たいらなやねがわら'],
    '木のふちのレシピセット': ['木のカベ'],
    '木のふち・ミニ': ['木のカベ'],
    '木のふち・かど': ['木のカベ'],
    'メタモンラグのレシピ': ['メタモンのはた'],
    'センサーのレシピ': ['そうさばん'],
    'おしゃれゆかいしのレシピ': ['おしゃれタイル', 'おしゃれかいだん'],
    'うみべのいえづくりレシピセット': ['いえのしきり'],
    'ふねのさくのレシピ': ['ふねのドア'],
    'レンガのカベのレシピ': ['レンガ'],
    'モダンなドアのレシピ': ['スタイリッシュなドア', 'モダンなカベ'],
    'あげさげまどのレシピ': ['ガラスまど'],
    'しっくいカベのレシピ': ['うちっぱなしのカベ'],
    'やねのレシピセット': ['おうぎやね'],
    'ポケセンたてなおしキット': ['ポケセンのカウンター'],
    'おかたづけをしようを作るヒント': ['だんボールのはこ', 'ちいさいゴミばこ'],
    'レンガのかいだんのレシピ': ['いしのかいだん'],
    'フタつきまどのレシピ': ['ガラスまど'],
    'でっぱりカベのレシピ': ['木のカベ'],
    'てつのハシゴのレシピ': ['てつのあしば', 'きゃたつ'],
    'いしやねのレシピ': ['おうぎやね', 'いしのタイル'],
}


@dataclass(frozen=True)
class ImageEntry:
    name_jp: str
    name_ko: str | None
    image_path: str


@dataclass(frozen=True)
class GamewithItemRecord:
    name_jp: str
    category_jp: str | None
    flag_key: str | None
    image_path: str | None
    recipe_jp: str | None


def load_site_data() -> dict:
    return json.loads(SITE_DATA_FILE.read_text(encoding='utf-8'))


def build_favorite_tag_payload(site_data: dict) -> tuple[list[dict], dict[str, list[dict]], dict[str, set[str]], dict[str, set[str]]]:
    if not FAVORITE_TAG_MASTER_FILE.exists():
        return [], {}, {}, {}

    tag_master: dict[str, dict] = {}
    with FAVORITE_TAG_MASTER_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            tag_id = (row.get('tag_id') or '').strip()
            name_jp = (row.get('tag_label_jp') or '').strip()
            if not tag_id or not name_jp:
                continue

            translation = FAVORITE_TAG_TRANSLATIONS.get(tag_id, {})
            tag_master[tag_id] = {
                'id': tag_id,
                'nameJp': name_jp,
                'nameKo': translation.get('nameKo', name_jp),
                'translationStatus': translation.get('translationStatus', 'untranslated'),
                'pokemonCount': int((row.get('pokemon_count') or '0').strip() or 0),
                'itemCount': int((row.get('item_count') or '0').strip() or 0),
            }

    pokemon_slugs_by_name_jp: dict[str, set[str]] = defaultdict(set)
    for entry in site_data.get('pokemon', []):
        name_jp = (entry.get('nameJp') or '').strip()
        slug = (entry.get('slug') or '').strip()
        if name_jp and slug:
            pokemon_slugs_by_name_jp[name_jp].add(slug)

    pokemon_tag_ids_by_slug: dict[str, set[str]] = defaultdict(set)
    if FAVORITE_TAG_POKEMON_FILE.exists():
        with FAVORITE_TAG_POKEMON_FILE.open(encoding='utf-8') as file:
            for row in csv.DictReader(file):
                name_jp = (row.get('pokemon_name_jp') or '').strip()
                tag_id = (row.get('tag_id') or '').strip()
                if not name_jp or tag_id not in tag_master:
                    continue

                for slug in pokemon_slugs_by_name_jp.get(name_jp, ()):
                    pokemon_tag_ids_by_slug[slug].add(tag_id)

    item_tag_ids_by_name_jp: dict[str, set[str]] = defaultdict(set)
    item_tag_ids_by_normalized_name: dict[str, set[str]] = defaultdict(set)
    if FAVORITE_TAG_ITEM_FILE.exists():
        with FAVORITE_TAG_ITEM_FILE.open(encoding='utf-8') as file:
            for row in csv.DictReader(file):
                name_jp = (row.get('item_name_jp') or '').strip()
                tag_id = (row.get('tag_id') or '').strip()
                if not name_jp or tag_id not in tag_master:
                    continue

                item_tag_ids_by_name_jp[name_jp].add(tag_id)
                item_tag_ids_by_normalized_name[normalize_lookup_key(name_jp)].add(tag_id)

    favorite_tags = sorted(tag_master.values(), key=lambda entry: int(entry['id'].removeprefix('tag')))
    pokemon_favorite_tags_by_slug = {
        slug: [tag_master[tag_id] for tag_id in sorted(tag_ids, key=lambda value: int(value.removeprefix('tag')))]
        for slug, tag_ids in pokemon_tag_ids_by_slug.items()
    }

    return favorite_tags, pokemon_favorite_tags_by_slug, item_tag_ids_by_name_jp, item_tag_ids_by_normalized_name


def load_emote_obtain_map() -> dict[str, str]:
    if not HUMAN_RECORDS_FILE.exists():
        return {}

    mapping: dict[str, str] = {}
    with HUMAN_RECORDS_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            reward_jp = (row.get('direct_reward_jp') or '').strip()
            if not reward_jp.startswith('エモート「') or not reward_jp.endswith('」'):
                continue

            name_jp = reward_jp.removeprefix('エモート「').removesuffix('」')
            map_ko = (row.get('map_name_ko_editorial') or '').strip()
            location_ko = (row.get('location_detail_ko_editorial') or '').strip()
            if not map_ko and not location_ko:
                continue

            mapping[name_jp] = ' · '.join(part for part in [map_ko, location_ko] if part)

    return mapping


def load_emote_name_map() -> dict[str, str]:
    if not HUMAN_RECORDS_FILE.exists():
        return {}

    mapping: dict[str, str] = {}
    with HUMAN_RECORDS_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            reward_jp = (row.get('direct_reward_jp') or '').strip()
            reward_ko = (row.get('direct_reward_ko_editorial') or '').strip()
            if not reward_jp.startswith('エモート「') or not reward_jp.endswith('」'):
                continue
            if not reward_ko.startswith('감정표현: '):
                continue

            name_jp = reward_jp.removeprefix('エモート「').removesuffix('」')
            name_ko = reward_ko.removeprefix('감정표현: ').strip()
            if name_jp and name_ko:
                mapping[name_jp] = name_ko

    return mapping


def load_material_map() -> dict[str, str]:
    raw = json.loads(MATERIAL_MAP_FILE.read_text(encoding='utf-8'))
    mapping = {key: value for key, value in raw.items() if value}

    with MATERIAL_MANUAL_MAP_FILE.open(encoding='utf-8') as file:
        for row in csv.DictReader(file):
            key = row.get('jp_term', '').strip()
            value = row.get('ko_confirmed', '').strip()
            if key and value:
                mapping[key] = value

    return mapping


def normalize_lookup_key(text: str) -> str:
    normalized = text.strip()
    normalized = normalized.replace(' ', '').replace('\u3000', '')
    normalized = normalized.replace('・', '').replace('ー', '').replace('-', '')
    normalized = re.sub(r'（.*?）', '', normalized)
    normalized = re.sub(r'\(.*?\)', '', normalized)
    return normalized


def lookup_candidates(name_jp: str) -> list[str]:
    candidates = [name_jp]

    alias = ITEM_NAME_ALIASES.get(name_jp)
    if alias:
        candidates.append(alias)

    for pattern in (r'（.*?）', r'\(.*?\)'):
        stripped = re.sub(pattern, '', name_jp).strip()
        if stripped and stripped not in candidates:
            candidates.append(stripped)

    unique: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in unique:
            unique.append(candidate)
    return unique


def page_og_image_url(path: Path) -> str | None:
    if not path.exists():
        return None

    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    meta = soup.select_one('meta[property="og:image"], meta[name="twitter:image"], meta[name="twitter:image:src"]')
    if meta is None:
        return None

    content = (meta.get('content') or '').strip()
    if not content:
        return None
    if content.startswith('//'):
        content = 'https:' + content

    return normalize_remote_image_url(content)


GAMEWITH_ITEMDATA_PAGES = (
    ITEM_PAGE,
    ITEM_FURNITURE_PAGE,
    ITEM_MISC_PAGE,
    ITEM_OUTDOOR_PAGE,
    ITEM_UTILITY_PAGE,
    ITEM_BLOCKS_PAGE,
)


def load_gamewith_item_records(paths: Iterable[Path]) -> dict[str, GamewithItemRecord]:
    pattern = re.compile(
        r"\{id:'[^']+',n:'([^']+)',k:'[^']*',f:'([^']*)',aid:'[^']*',t:'([^']*)',i:'([^']*)',e:'((?:\\'|[^'])*)',g:'((?:\\'|[^'])*)',r:'((?:\\'|[^'])*)'",
        re.DOTALL,
    )

    records: dict[str, GamewithItemRecord] = {}
    for path in paths:
        if not path.exists():
            continue

        text = path.read_text(encoding='utf-8', errors='ignore')
        for match in pattern.finditer(text):
            name_jp, flags, category_jp, image_key = match.group(1), match.group(2), match.group(3), match.group(4)
            recipe_html = match.group(7)
            flag_key = flags.split()[0] if flags else None
            fallback_category = CATEGORY_BY_FLAG.get(flag_key or '')

            image_path = None
            if image_key and image_key != 'noimage' and re.match(r'^(?:item|building)_[^ ]+$', image_key):
                image_path = f'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/{image_key}.png'

            recipe_jp = BeautifulSoup(recipe_html.replace("\\'", "'"), 'html.parser').get_text(' ', strip=True) if recipe_html else None

            records.setdefault(
                name_jp,
                GamewithItemRecord(
                    name_jp=name_jp,
                    category_jp=category_jp or fallback_category,
                    flag_key=flag_key,
                    image_path=image_path,
                    recipe_jp=recipe_jp,
                ),
            )

    return records


def load_game8_detail_images(path: Path) -> dict[str, ImageEntry]:
    if not path.exists():
        return {}

    entries: dict[str, ImageEntry] = {}
    for file_path in sorted(path.glob('*.html')):
        soup = BeautifulSoup(file_path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
        title = soup.title.get_text(' ', strip=True) if soup.title else ''
        match = re.search(r'】(.+?)の入手方法', title)
        if match is None:
            continue

        name_jp = match.group(1).strip()
        image_url = None
        for image in soup.select('#article-body img, .a-paragraph img, table img'):
            alt = (image.get('alt') or '').strip()
            if name_jp not in alt:
                continue
            image_url = extract_remote_image_url(image)
            if image_url:
                break

        if image_url is None:
            continue

        entries.setdefault(name_jp, ImageEntry(name_jp, None, image_url))

    return entries


def lookup_gamewith_record(name_jp: str, records: dict[str, GamewithItemRecord]) -> GamewithItemRecord | None:
    for candidate in lookup_candidates(name_jp):
        record = records.get(candidate)
        if record is not None:
            return record

    normalized_targets = {normalize_lookup_key(candidate) for candidate in lookup_candidates(name_jp)}
    for key, record in records.items():
        if normalize_lookup_key(key) in normalized_targets:
            return record

    return None


def lookup_favorite_tag_ids(
    name_jp: str,
    item_tag_ids_by_name_jp: dict[str, set[str]],
    item_tag_ids_by_normalized_name: dict[str, set[str]],
) -> list[str]:
    found: set[str] = set()

    for candidate in lookup_candidates(name_jp):
        found.update(item_tag_ids_by_name_jp.get(candidate, set()))

    if found:
        return sorted(found, key=lambda value: int(value.removeprefix('tag')))

    for candidate in lookup_candidates(name_jp):
        found.update(item_tag_ids_by_normalized_name.get(normalize_lookup_key(candidate), set()))

    return sorted(found, key=lambda value: int(value.removeprefix('tag')))


def load_gamewith_recipe_reference_images(records: dict[str, GamewithItemRecord]) -> dict[str, ImageEntry]:
    entries: dict[str, ImageEntry] = {}

    for record in records.values():
        if not record.image_path or not record.recipe_jp:
            continue

        for recipe_name in re.findall(r'「([^」]+)」', record.recipe_jp):
            entries.setdefault(recipe_name, ImageEntry(recipe_name, None, record.image_path))

    return entries


def merge_missing_images(target: dict[str, ImageEntry], source: dict[str, ImageEntry]) -> None:
    for key, value in source.items():
        target.setdefault(key, value)


def load_image_maps() -> dict[str, dict[str, ImageEntry]]:
    raw = json.loads(IMAGE_MATCH_FILE.read_text(encoding='utf-8'))
    groups: dict[str, dict[str, ImageEntry]] = {
        'berry': {},
        'emote': {},
        'bestshot': {},
        'murals': {},
        'slates': {},
        'item': {},
        'recipe': {},
        'building': {},
        'doll': {},
        'cd': {},
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

    for path in GAMEWITH_ITEMDATA_PAGES:
        merge_missing_images(groups['item'], load_gamewith_itemdata_images(path))
    merge_missing_images(groups['item'], load_gamewith_gallery_images(BUILDING_PAGE))
    merge_missing_images(groups['item'], load_gamewith_gallery_images(PLUSH_PAGE))
    merge_missing_images(groups['item'], load_game8_list_images(GAME8_ITEM_PAGE))
    merge_missing_images(groups['item'], load_game8_list_images(GAME8_RECIPE_PAGE))
    merge_missing_images(groups['item'], load_game8_detail_images(GAME8_ITEM_DETAIL_DIR))
    merge_missing_images(groups['recipe'], load_recipe_pin_images())
    merge_missing_images(groups['recipe'], load_game8_list_images(GAME8_RECIPE_PAGE))
    merge_missing_images(groups['building'], load_gamewith_gallery_images(BUILDING_PAGE))
    merge_missing_images(groups['doll'], load_gamewith_gallery_images(PLUSH_PAGE))

    return groups


def is_valid_gamewith_alt(alt: str) -> bool:
    stripped = alt.strip()
    if not stripped or stripped.isdigit():
        return False
    if stripped.startswith('ぽこあポケモンの') or stripped.endswith('画像'):
        return False
    return True


def pick_gamewith_image_url(url: str) -> str:
    parts = [part.strip() for part in url.split(',') if part.strip()]
    for part in reversed(parts):
        if part.startswith('https://img.gamewith.jp/'):
            return part
    return url.strip()


def load_gamewith_gallery_images(path: Path) -> dict[str, ImageEntry]:
    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    entries: dict[str, ImageEntry] = {}

    for img in soup.select('img[data-original]'):
        alt = (img.get('alt') or '').strip()
        url = (img.get('data-original') or '').strip()
        if not is_valid_gamewith_alt(alt):
            continue
        if '/article_tools/pocoapokemon/gacha/' not in url:
            continue
        entries.setdefault(alt, ImageEntry(alt, None, pick_gamewith_image_url(url)))

    return entries


def load_gamewith_itemdata_images(path: Path) -> dict[str, ImageEntry]:
    if not path.exists():
        return {}

    text = path.read_text(encoding='utf-8', errors='ignore')
    entries: dict[str, ImageEntry] = {}

    for name_jp, image_key in re.findall(r"\{id:'[^']+',n:'([^']+)'.*?i:'((?:item|building)_[^']+)'", text, re.DOTALL):
        if not is_valid_gamewith_alt(name_jp):
            continue
        entries.setdefault(
            name_jp,
            ImageEntry(
                name_jp,
                None,
                f'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/{image_key}.png',
            ),
        )

    return entries


def normalize_remote_image_url(url: str) -> str:
    normalized = url.strip()
    if normalized.endswith('/show'):
        normalized = normalized[: -len('/show')] + '/original'
    return normalized


def extract_remote_image_url(node) -> str | None:
    if node is None:
        return None

    for attr in ('data-image-url', 'data-src', 'src'):
        value = (node.get(attr) or '').strip()
        if value and not value.startswith('data:image/'):
            return normalize_remote_image_url(value)

    image = node.select_one('img') if hasattr(node, 'select_one') else None
    if image is not None:
        return extract_remote_image_url(image)

    return None


def load_game8_list_images(path: Path, table_index: int = 1) -> dict[str, ImageEntry]:
    if not path.exists():
        return {}

    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    tables = soup.select('table')
    if len(tables) <= table_index:
        return {}

    entries: dict[str, ImageEntry] = {}
    for row in tables[table_index].select('tr')[1:]:
        cells = row.select('td')
        if not cells:
            continue

        first_cell = cells[0]
        name_jp = first_cell.get_text(' ', strip=True)
        image_url = extract_remote_image_url(first_cell.select_one('img'))
        if not name_jp or not image_url:
            continue

        entries.setdefault(name_jp, ImageEntry(name_jp, None, image_url))

    return entries


def load_recipe_pin_images() -> dict[str, ImageEntry]:
    text = RECIPE_PAGE.read_text(encoding='utf-8', errors='ignore')
    match = re.search(r'window\._pinDatas=(\[.*?\]);\$\(', text)
    if match is None:
        return {}

    normalized = re.sub(r',([}\]])', r'\1', match.group(1))
    pin_data = json.loads(normalized)
    entries: dict[str, ImageEntry] = {}

    for row in pin_data:
        raw_name = row.get('name', '')
        image_url = pick_gamewith_image_url(row.get('pinImage', ''))
        if not raw_name or not image_url:
            continue

        for chunk in re.split(r'<br\s*/?>', raw_name):
            name = BeautifulSoup(chunk, 'html.parser').get_text(' ', strip=True)
            if not is_valid_gamewith_alt(name):
                continue
            entries.setdefault(name, ImageEntry(name, None, image_url))

    return entries


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


def stable_id(prefix: str, *parts: str) -> str:
    digest = hashlib.md5('||'.join(parts).encode('utf-8')).hexdigest()[:10]
    return f'{prefix}-{digest}'


def merge_quantity_tokens(tokens: list[str]) -> list[str]:
    merged: list[str] = []
    index = 0

    while index < len(tokens):
        current = tokens[index]
        if index + 1 < len(tokens) and re.fullmatch(r'×\d+', tokens[index + 1]):
            merged.append(f'{current} {tokens[index + 1]}')
            index += 2
            continue

        merged.append(current)
        index += 1

    return merged


def ko_name(name_jp: str, pokemon_ko: dict[str, str], material_map: dict[str, str], label_ko: dict[str, str]) -> str | None:
    if name_jp in EXTRA_TERM_KO:
        return EXTRA_TERM_KO[name_jp]
    if name_jp in GUIDE_TERM_KO:
        return GUIDE_TERM_KO[name_jp]
    if name_jp in material_map:
        return material_map[name_jp]
    if name_jp in OFFICIAL_ITEM_KO:
        return OFFICIAL_ITEM_KO[name_jp]
    if name_jp in MANUAL_KO:
        return MANUAL_KO[name_jp]
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


def translate_name_text(text: str, pokemon_ko: dict[str, str], material_map: dict[str, str], label_ko: dict[str, str]) -> str:
    exact = ko_name(text, pokemon_ko, material_map, label_ko)
    if exact:
        return exact

    translated = text
    translated = replace_all(translated, pokemon_ko)
    translated = replace_all(translated, MAP_KO)
    translated = replace_all(translated, EXTRA_TERM_KO)
    translated = replace_all(translated, GUIDE_TERM_KO)
    translated = replace_all(translated, material_map)
    translated = replace_all(translated, OFFICIAL_ITEM_KO)
    translated = replace_all(translated, MANUAL_KO)
    translated = replace_all(translated, NAME_TOKEN_KO)
    translated = translated.replace('の', ' ')
    translated = translated.replace('・', ' · ')
    translated = translated.replace('（', '(').replace('）', ')')
    translated = re.sub(r'\s+', ' ', translated)
    return translated.strip()


def translate_place_text(
    text: str,
    pokemon_ko: dict[str, str] | None = None,
    material_map: dict[str, str] | None = None,
    label_ko: dict[str, str] | None = None,
) -> str:
    pokemon_ko = pokemon_ko or {}
    material_map = material_map or {}
    label_ko = label_ko or {}

    translated = ' '.join(text.split())
    translated = replace_all(translated, PLACE_REPLACEMENTS)
    translated = replace_all(translated, MAP_KO)
    translated = replace_all(translated, pokemon_ko)
    translated = replace_all(translated, EXTRA_TERM_KO)
    translated = replace_all(translated, GUIDE_TERM_KO)
    translated = replace_all(translated, material_map)
    translated = replace_all(translated, OFFICIAL_ITEM_KO)
    translated = replace_all(translated, label_ko)
    translated = replace_all(translated, MANUAL_KO)
    translated = translated.replace('▶行き方動画', '')
    translated = translated.replace('▶場所マップ', '')
    translated = translated.replace('のダウジングでも入手可能', ' 다우징으로도 획득 가능')
    translated = translated.replace('のダウジングで入手', ' 다우징으로 획득')
    translated = translated.replace('ダウジングで入手', '다우징으로 획득')
    translated = re.sub(r'([가-힣A-Za-z0-9\s]+)のダウジングでも入手可能', r'\1 다우징으로도 획득 가능', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9\s]+)のダウジングで入手', r'\1 다우징으로 획득', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9\s]+)の(?=다우징)', r'\1 ', translated)
    translated = translated.replace('の다우징', ' 다우징')
    translated = translated.replace('ダウジング', '다우징')
    translated = translated.replace('다우징에서 획득', '다우징으로 획득')
    translated = translated.replace('で入手可能', '에서 획득 가능')
    translated = translated.replace('で入手', '에서 획득')
    translated = replace_all(translated, NAME_TOKEN_KO)
    translated = translated.replace('「', '').replace('」', '')
    translated = translated.replace('のおねがい', '의 부탁')
    translated = translated.replace('を友達にすると', '를 친구로 만들면 ')
    translated = translated.replace('を2回クリアで入手', '을 2번 클리어하면 획득')
    translated = translated.replace('を入手した際に', '을 획득했을 때 ')
    translated = translated.replace('を入手すると', '을 획득하면 ')
    translated = translated.replace('ひらめく', '영감')
    translated = translated.replace('で購入', '에서 구매')
    translated = translated.replace('で解放', '에서 해금')
    translated = translated.replace('、', ',')
    translated = translated.replace('の', ' ')
    translated = translated.replace(' を획득했을 때', '를 획득했을 때')
    translated = translated.replace(' 용광로 で ', ' 용광로에서 ')
    translated = translated.replace('용광로 で ', '용광로에서 ')
    translated = translated.replace(' 상점에서 400코인で구매', ' 상점에서 400코인 구매')
    translated = translated.replace('의 부탁を2回クリア에서 획득', '의 부탁을 2번 클리어하면 획득')
    translated = translated.replace('を2回クリア에서 획득', '을 2번 클리어하면 획득')
    translated = translated.replace('처음부터 소지에서 획득', '처음부터 소지')
    translated = translated.replace('모으령의 관', '모으령 관')
    translated = re.sub(r'환경 레벨 (\d+)で', r'환경 레벨 \1에서', translated)
    translated = re.sub(r'([0-9]+)코인で구매', r'\1코인 구매', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9])Lv(\d+)', r'\1 Lv\2', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9\s]+)の(북부|동부|남부|서부)', r'\1 \2', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9]+)\s+의\s+', r'\1의 ', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9]+)\s+와\s+', r'\1와 ', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9]+)\s+과\s+', r'\1과 ', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9]+)\s+을\s+', r'\1을 ', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9]+)\s+를\s+', r'\1를 ', translated)
    translated = re.sub(r'([가-힣A-Za-z0-9]+)\s+에게\s+', r'\1에게 ', translated)
    translated = re.sub(r'\s+', ' ', translated)
    translated = translated.replace(' 에서', '에서')
    translated = translated.replace('プチ図書館', '미니 도서관')
    translated = translated.replace('기타 가구としてフィールドに置く', '기타 가구로 필드에 놓기')
    translated = translated.replace('기타 飾り物としてフィールドに置く', '기타 장식물로 필드에 놓기')
    translated = translated.replace('흔들풍손に見せると꿈섬に行ける', '흔들풍손에게 보여주면 꿈섬에 갈 수 있다')
    translated = translated.replace('기타 食べるとPPを回復する', '기타 먹으면 PP를 회복한다')
    translated = translated.replace('기타 畑に水をやる', '기타 밭에 물을 준다')
    translated = translated.replace('기타 すみかで使うと포켓몬が帰ってくる', '기타 거처에서 사용하면 포켓몬이 돌아온다')
    translated = translated.replace('레시피 용광로 ス푸린クラー 기타 용광로에 넣으면 철 주괴가 된다', '레시피: 용광로, 스프링클러 / 기타: 용광로에 넣으면 철 주괴가 된다')
    translated = translated.replace('레시피 냄비 프라이팬 기타 구리を용광로で加工。見た目はチョコレートに似てるかも。', '레시피: 냄비, 프라이팬 / 기타: 구리를 용광로에서 가공한다. 보기에는 초콜릿 같을지도 모른다.')
    translated = translated.replace('레시피 철제 테이블 철 だい 기타 철を용광로で加工。とっても固くてずっしり重い。', '레시피: 철제 테이블, 철제 받침대 / 기타: 철을 용광로에서 가공한다. 아주 단단하고 묵직하다.')
    translated = translated.replace('레시피 ビッグ수납박스 구급상자', '레시피: 빅 수납 박스, 구급상자')
    translated = translated.replace('기타 루기아,칠색조 획득ため スズ作成に必要。写真から아이템 複製にも使える。', '기타: 루기아와 칠색조를 얻기 위한 방울 제작에 필요하다. 사진으로 아이템을 복제할 때도 쓴다.')
    translated = translated.replace('기타 칠색조 획득ため スズ作成に必要。모으령に渡すと珍しい아이템がもらえる。', '기타: 칠색조를 얻기 위한 방울 제작에 필요하다. 모으령에게 주면 희귀한 아이템을 받을 수 있다.')
    translated = translated.replace('기타 루기아 획득ため スズ作成に必要。모으령に渡すと珍しい아이템がもらえる。', '기타: 루기아를 얻기 위한 방울 제작에 필요하다. 모으령에게 주면 희귀한 아이템을 받을 수 있다.')
    translated = translated.replace('기타 溶鉱炉で점화と포케메탈이 된다.', '기타: 용광로에 넣으면 포케메탈이 된다.')
    translated = translated.replace('기타 깨봉이などで리사이클すると紙になる。', '기타: 깨봉이 등으로 재활용하면 종이가 된다.')
    translated = translated.replace('기타 そこらへんに落ちてる쓰레기。一部 포켓몬は好むらしい。', '기타: 여기저기 떨어져 있는 쓰레기다. 일부 포켓몬이 좋아하는 듯하다.')
    translated = translated.replace('레시피 리조트 라이트 기타 海 波にもまれて丸くなった유리 。유리 製品 재료になる。', '레시피: 리조트 라이트 / 기타: 바다 파도에 닳아 둥글어진 유리 조각. 유리 제품 재료가 된다.')
    translated = translated.replace('기타 自分 街にきた他 プレイヤー 포켓몬に渡すとおみやげと交換することができる。', '기타: 내 마을에 온 다른 플레이어의 포켓몬에게 건네면 기념품과 교환할 수 있다.')
    translated = translated.replace('기타 食べると풀베기が強化される', '기타: 먹으면 풀베기가 강화된다')
    translated = translated.replace('기타 통통코イベントで使用', '기타: 통통코 이벤트에서 사용')
    translated = translated.replace('쓰레기ばこ', '쓰레기통')
    translated = translated.replace('1마리째：', '1마리째:')
    translated = translated.replace('2마리째：', '2마리째:')
    translated = translated.replace('우중충한 해변で잠만보を起こ아래後', '우중충한 해변에서 잠만보를 깨운 뒤')
    translated = translated.replace('( ', '(').replace(' )', ')').strip()
    return translated


def cleanup_ko_note(text: str) -> str:
    cleaned = text.replace('の다우징', ' 다우징')
    cleaned = cleaned.replace('다우징에서 획득', '다우징으로 획득')
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned.strip()


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


def image_path_for(name_jp: str, *image_maps: dict[str, ImageEntry]) -> str | None:
    for image_map in image_maps:
        for candidate in lookup_candidates(name_jp):
            image = image_map.get(candidate)
            if image:
                return image.image_path

        normalized_targets = {normalize_lookup_key(candidate) for candidate in lookup_candidates(name_jp)}
        for key, image in image_map.items():
            if normalize_lookup_key(key) in normalized_targets:
                return image.image_path
    return None


def recipe_result_candidates(name_jp: str) -> list[str]:
    candidates = [name_jp]

    if name_jp.endswith('のレシピ'):
        candidates.append(name_jp[: -len('のレシピ')])
    if name_jp.endswith('レシピ'):
        candidates.append(name_jp[: -len('レシピ')].rstrip('の '))
    if name_jp.endswith('レシピセット'):
        candidates.append(name_jp[: -len('レシピセット')].rstrip('の '))
    if name_jp.endswith('を作るヒント'):
        candidates.append(name_jp[: -len('を作るヒント')].strip())
    for alias in RECIPE_IMAGE_ALIASES.get(name_jp, []):
        candidates.append(alias)

    unique: list[str] = []
    for candidate in candidates:
        stripped = candidate.strip()
        if stripped and stripped not in unique:
            unique.append(stripped)

    return unique


def recipe_image_path(name_jp: str, recipe_images: dict[str, ImageEntry], item_images: dict[str, ImageEntry]) -> str | None:
    for candidate in recipe_result_candidates(name_jp):
        image = recipe_images.get(candidate) or item_images.get(candidate)
        if image:
            return image.image_path
    return None


ITEM_IMAGE_OVERRIDES: dict[str, str] = {
    # In-game screenshot IMG_1570 confirms this entry is the gaming bed item.
    'ゲーミングヘッド': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_650.png',
    # In-game screenshot IMG_1586 confirms this icon is used for strength rock.
    'かいりきいわ': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_669.png',
}


def absolute_source_url(href: str | None, fallback: str) -> str:
    if not href:
        return fallback
    return urljoin('https://game8.jp', href)


def table_at(path: Path, index: int) -> BeautifulSoup:
    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    tables = soup.select('table')
    if len(tables) <= index:
        raise RuntimeError(f'Could not find table #{index} in {path}')
    return tables[index]


def parse_dream_islands(
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    doll_images: dict[str, ImageEntry],
) -> tuple[list[dict], list[dict], dict]:
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
                'requiredDollKo': translate_name_text(doll_jp, pokemon_ko, material_map, {}),
                'requiredDollNoteJp': ' '.join(doll_note_tokens).strip(),
                'requiredDollNoteKo': cleanup_ko_note(translate_place_text(' '.join(doll_note_tokens).strip(), pokemon_ko, material_map, {})),
                'legendaryJp': legendary_jp,
                'legendaryKo': pokemon_ko.get(legendary_jp) if legendary_jp else None,
                'findingsJp': find_list,
                'findingsKo': [translate_name_text(item, pokemon_ko, material_map, {}) for item in find_list],
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
                'nameKo': translate_name_text(name_jp, pokemon_ko, material_map, {}),
                'mapJp': map_jp,
                'mapKo': MAP_KO.get(map_jp, map_jp),
                'dreamIslandJp': dream_jp,
                'dreamIslandKo': DREAM_ISLAND_KO.get(dream_jp, dream_jp),
                'noteJp': ' '.join(note_tokens).strip(),
                'noteKo': cleanup_ko_note(translate_place_text(' '.join(note_tokens).strip(), pokemon_ko, material_map, {})),
                'imagePath': image_path_for(name_jp, doll_images),
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


def parse_cooking(label_ko: dict[str, str], pokemon_ko: dict[str, str], item_images: dict[str, ImageEntry]) -> dict:
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
                'nameKo': translate_name_text(name_jp, pokemon_ko, {}, label_ko),
                'imagePath': image_path_for(name_jp, item_images),
                'categoryJp': category_jp,
                'categoryKo': ko_name(category_jp, {}, {}, label_ko),
                'tasteJp': taste_jp,
                'tasteKo': MANUAL_KO.get(taste_jp),
                'materialsJp': materials_jp,
                'materialsKo': [translate_name_text(item, pokemon_ko, {}, label_ko) for item in materials_jp],
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
            'nameKo': MANUAL_KO.get('ジャガイモハンバーグ'),
            'reasonKo': '바위깨기 강화폭이 커서 채굴, 정지 작업, 포케메탈 파밍에 가장 쓰기 좋다',
        },
        {
            'nameJp': 'アツアツスープパン',
            'nameKo': MANUAL_KO.get('アツアツスープパン'),
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
                '요리명과 재료명은 확보한 한국어 표기를 기준으로 정리했다',
            ],
        },
        'toolCards': tool_cards,
        'categoryEffects': category_effects,
        'recommended': recommended,
        'dishes': dishes,
    }


def parse_recipe_data(
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    label_ko: dict[str, str],
    recipe_images: dict[str, ImageEntry],
    item_images: dict[str, ImageEntry],
) -> tuple[list[dict], list[dict]]:
    texts = body_texts(RECIPE_PAGE)
    default_recipe_image = page_og_image_url(RECIPE_PAGE)
    shop_entries: list[dict] = []
    index = texts.index('クラフトだいのレシピ')
    while texts[index] != 'たきび':
        name_jp = texts[index]
        location_jp = texts[index + 2]
        price = int(texts[index + 4]) if texts[index + 4].isdigit() else None
        shop_entries.append(
            {
                'id': stable_id('shop-entry', name_jp, location_jp),
                'nameJp': name_jp,
                'nameKo': translate_name_text(name_jp, pokemon_ko, material_map, label_ko),
                'imagePath': recipe_image_path(name_jp, recipe_images, item_images) or default_recipe_image,
                'sourceType': 'shop',
                'sourceJp': location_jp,
                'sourceKo': '입수처 미확인'
                if location_jp == '(レベル)'
                else translate_place_text(location_jp, pokemon_ko, material_map, label_ko),
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
                'id': stable_id('other-entry', name_jp, condition_jp),
                'nameJp': name_jp,
                'nameKo': translate_name_text(name_jp, pokemon_ko, material_map, label_ko),
                'imagePath': recipe_image_path(name_jp, recipe_images, item_images) or default_recipe_image,
                'sourceType': 'other',
                'sourceJp': condition_jp,
                'sourceKo': translate_place_text(condition_jp, pokemon_ko, material_map, label_ko),
                'price': None,
                'sourceUrl': RECIPE_SOURCE_URL,
            }
        )

    return shop_entries, other_entries


def parse_buildings(
    label_ko: dict[str, str],
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    building_images: dict[str, ImageEntry],
    item_images: dict[str, ImageEntry],
    all_items: list[dict],
) -> list[dict]:
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
            'nameKo': translate_name_text(name_jp, pokemon_ko, material_map, label_ko),
            'typeJp': entry_type,
            'typeKo': MANUAL_KO.get(entry_type, entry_type),
            'sourceUrl': BUILDING_SOURCE_URL,
            'imagePath': image_path_for(name_jp, building_images, item_images),
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
            materials_jp = merge_quantity_tokens(materials_jp)
            entry.update(
                {
                    'useJp': ' '.join(use_parts),
                    'useKo': translate_place_text(' '.join(use_parts), pokemon_ko, material_map, label_ko),
                    'recipeJp': recipe_jp,
                    'recipeKo': translate_place_text(recipe_jp, pokemon_ko, material_map, label_ko),
                    'requiredSpecialtiesJp': specialties_jp,
                    'requiredSpecialtiesKo': [label_ko.get(item, item) for item in specialties_jp],
                    'requiredMaterialsJp': materials_jp,
                    'requiredMaterialsKo': [translate_name_text(item, pokemon_ko, material_map, label_ko) for item in materials_jp],
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
                    'descriptionKo': translate_place_text(' '.join(desc_parts), pokemon_ko, material_map, label_ko),
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

    existing_names = {entry['nameJp'] for entry in entries}
    for item in all_items:
        name_jp = item['nameJp']
        if name_jp not in EXTRA_BUILDING_ITEM_TYPES or name_jp in existing_names:
            continue

        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': item['nameKo'],
                'typeJp': item.get('categoryJp') or '設備',
                'typeKo': EXTRA_BUILDING_ITEM_TYPES[name_jp],
                'sourceUrl': item['sourceUrl'],
                'imagePath': item.get('imagePath') or image_path_for(name_jp, building_images, item_images),
                'descriptionJp': item.get('useJp'),
                'descriptionKo': item.get('useKo'),
                'useJp': item.get('useJp'),
                'useKo': item.get('useKo'),
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

    return entries


def parse_dolls(
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    doll_images: dict[str, ImageEntry],
    item_images: dict[str, ImageEntry],
) -> list[dict]:
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
                'noteKo': cleanup_ko_note(translate_place_text(' '.join(note_parts).strip(), pokemon_ko, material_map, {})),
                'imagePath': image_path_for(name_jp, doll_images, item_images),
                'sourceUrl': PLUSH_SOURCE_URL,
            }
        )

    return entries


def parse_berries(image_map: dict[str, ImageEntry], item_images: dict[str, ImageEntry]) -> list[dict]:
    texts = body_texts(BERRY_PAGE)
    entries = [
            {
                'id': 'ヒメリのみ',
                'nameJp': 'ヒメリのみ',
                'nameKo': MANUAL_KO.get('ヒメリのみ'),
                'imagePath': image_path_for('ヒメリのみ', image_map, item_images),
            'obtainJp': '자연 생성 + 나무 재배',
            'obtainKo': '기본 자연 생성 열매이며 직접 키우는 루트의 기준 열매',
            'notesKo': [
                '과사열매 + 다른 1종은 자연 생성',
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
        image_path = image_path_for(name_jp, image_map, item_images)
        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': MANUAL_KO.get(name_jp),
                'imagePath': image_path,
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


def parse_emotes(image_map: dict[str, ImageEntry], obtain_map: dict[str, str]) -> list[dict]:
    emote_name_map = load_emote_name_map()
    game8_entries: dict[str, dict] = {}
    if GAME8_EMOTE_PAGE.exists():
        table = table_at(GAME8_EMOTE_PAGE, 1)
        rows = table.select('tr')[1:]
        index = 0

        while index < len(rows):
            first_row = rows[index]
            second_row = rows[index + 1] if index + 1 < len(rows) else None
            cells = first_row.select('td')
            if len(cells) < 3:
                index += 1
                continue

            raw_label = cells[0].get_text(' ', strip=True)
            if not raw_label.startswith('エモート「') or not raw_label.endswith('」'):
                index += 1
                continue

            name_jp = raw_label.removeprefix('エモート「').removesuffix('」')
            obtain_jp = second_row.get_text(' ', strip=True) if second_row is not None else ''
            obtain_jp = re.sub(r'^マップ名\s*', '', obtain_jp).replace(' 詳細 ', ' · ')
            image = image_map.get(name_jp)
            game8_entries[name_jp] = {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': emote_name_map.get(name_jp) or EXTRA_TERM_KO.get(name_jp) or (image.name_ko if image else None),
                'imagePath': image.image_path if image else (
                    extract_remote_image_url(cells[2].select_one('.imageLink'))
                    or extract_remote_image_url(cells[2].select_one('img'))
                ),
                'obtainJp': obtain_jp,
                'obtainKo': obtain_map.get(name_jp) or translate_place_text(replace_all(obtain_jp, ITEM_USE_LABEL_KO)),
                'sourceUrl': GAME8_EMOTE_SOURCE_URL,
            }
            index += 2

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
        game8_entry = game8_entries.get(name_jp)
        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': emote_name_map.get(name_jp) or EXTRA_TERM_KO.get(name_jp) or (image.name_ko if image else None) or (game8_entry.get('nameKo') if game8_entry else None),
                'imagePath': image.image_path if image else (game8_entry.get('imagePath') if game8_entry else None),
                'obtainJp': game8_entry.get('obtainJp') if game8_entry else obtain_jp,
                'obtainKo': game8_entry.get('obtainKo') if game8_entry else (obtain_map.get(name_jp) or translate_place_text(obtain_jp)),
                'sourceUrl': EMOTE_SOURCE_URL if image else (game8_entry.get('sourceUrl') if game8_entry else EMOTE_SOURCE_URL),
            }
        )

    ordered_names = [entry['nameJp'] for entry in entries]
    for name_jp, entry in game8_entries.items():
        if name_jp not in ordered_names:
            entries.append(entry)

    return entries


def parse_bestshots(
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    label_ko: dict[str, str],
    image_map: dict[str, ImageEntry],
) -> list[dict]:
    game8_entries: dict[str, dict] = {}
    if GAME8_BESTSHOT_PAGE.exists():
        table = table_at(GAME8_BESTSHOT_PAGE, 1)

        for row in table.select('tr')[1:]:
            cells = row.select('th,td')
            if len(cells) < 3:
                continue

            name_jp = re.sub(r'^拡大\s*', '', cells[1].get_text(' ', strip=True))
            if not name_jp:
                continue
            if name_jp == 'たき火でポカポカ':
                name_jp = 'たき火でぽかぽか'

            detail_text = cells[2].get_text(' ', strip=True)
            reward_match = re.search(r'報酬\s*(フォトフレーム「[^」]+」|なし)', detail_text)
            reward_jp = reward_match.group(1) if reward_match else 'なし'

            pokemon_match = re.search(r'ポケモン\s*(.*?)(?=\s*アイテム|\s*報酬|\s*詳細|$)', detail_text)
            item_match = re.search(r'アイテム\s*(.*?)(?=\s*報酬|\s*詳細|$)', detail_text)
            extra_match = re.search(r'詳細\s*(.*)$', detail_text)

            condition_parts_ko: list[str] = []
            if pokemon_match:
                pokemon_condition_ko = translate_place_text(
                    pokemon_match.group(1).strip().replace('1匹目', '1마리째').replace('2匹目', '2마리째').replace('自由', '자유'),
                    pokemon_ko,
                    material_map,
                    label_ko,
                )
                if pokemon_condition_ko:
                    condition_parts_ko.append(f'포켓몬: {pokemon_condition_ko}')
            if item_match:
                item_ko = translate_place_text(replace_all(item_match.group(1).strip(), ITEM_USE_LABEL_KO), pokemon_ko, material_map, label_ko)
                if item_ko:
                    condition_parts_ko.append(f'아이템: {item_ko}')
            if extra_match:
                extra_ko = translate_place_text(extra_match.group(1).strip(), pokemon_ko, material_map, label_ko)
                if extra_ko:
                    condition_parts_ko.append(f'추가 조건: {extra_ko}')

            image = image_map.get(name_jp)
            game8_entries[name_jp] = {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': BESTSHOT_NAME_KO.get(name_jp, translate_name_text(name_jp, pokemon_ko, material_map, label_ko)),
                'imagePath': image.image_path if image else (extract_remote_image_url(cells[1].select_one('.imageLink')) or extract_remote_image_url(cells[1].select_one('img'))),
                'conditionJp': detail_text,
                'conditionKo': BESTSHOT_CONDITION_KO.get(
                    name_jp,
                    ' / '.join(condition_parts_ko)
                    or translate_place_text(replace_all(detail_text, ITEM_USE_LABEL_KO), pokemon_ko, material_map, label_ko),
                ),
                'rewardJp': reward_jp,
                'rewardKo': BESTSHOT_REWARD_KO.get(
                    reward_jp,
                    BESTSHOT_REWARD_KO.get(
                        reward_jp.replace('を入手', ''),
                        translate_place_text(reward_jp, pokemon_ko, material_map, label_ko).replace('フォトフレーム', '포토프레임'),
                    ),
                ),
                'sourceUrl': GAME8_BESTSHOT_SOURCE_URL,
            }

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
        game8_entry = game8_entries.get(name_jp)
        entries.append(
            {
                'id': slugify(name_jp),
                'nameJp': name_jp,
                'nameKo': BESTSHOT_NAME_KO.get(name_jp) or EXTRA_TERM_KO.get(name_jp) or (image.name_ko if image else None) or (game8_entry.get('nameKo') if game8_entry else None),
                'imagePath': image.image_path if image else (game8_entry.get('imagePath') if game8_entry else None),
                'conditionJp': game8_entry.get('conditionJp') if game8_entry else condition_jp,
                'conditionKo': game8_entry.get('conditionKo') if game8_entry else BESTSHOT_CONDITION_KO.get(name_jp, condition_jp),
                'rewardJp': game8_entry.get('rewardJp') if game8_entry else reward_jp,
                'rewardKo': game8_entry.get('rewardKo') if game8_entry else BESTSHOT_REWARD_KO.get(reward_jp, translate_place_text(reward_jp)),
                'sourceUrl': BESTSHOT_SOURCE_URL if image else (game8_entry.get('sourceUrl') if game8_entry else BESTSHOT_SOURCE_URL),
            }
        )

    ordered_names = [entry['nameJp'] for entry in entries]
    for name_jp, entry in game8_entries.items():
        if name_jp not in ordered_names:
            entries.append(entry)

    return entries


def parse_cds(cd_images: dict[str, ImageEntry], item_images: dict[str, ImageEntry]) -> list[dict]:
    default_image = None
    if GAME8_CD_PAGE.exists():
        soup = BeautifulSoup(GAME8_CD_PAGE.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
        tables = soup.select('table')
        if len(tables) > 3:
            default_image = extract_remote_image_url(tables[3].select_one('img'))
        if default_image is None:
            default_image = extract_remote_image_url(soup.select_one('#hm_5 + p img')) or page_og_image_url(GAME8_CD_PAGE)
    if default_image is None:
        default_image = page_og_image_url(CD_PAGE)

    if GAME8_CD_PAGE.exists():
        table = table_at(GAME8_CD_PAGE, 1)
        names = [row.select('td')[0].get_text(' ', strip=True) for row in table.select('tr')[1:] if row.select('td')]
        if names:
            return [
                {
                    'id': slugify(name_jp),
                    'nameJp': name_jp,
                    'nameKo': ko_name(name_jp, {}, {}, {}) or translate_name_text(name_jp, {}, {}, {}),
                    'imagePath': image_path_for(name_jp, cd_images) or default_image,
                    'obtainJp': '光る地面を掘ってランダム入手',
                    'obtainKo': '빛나는 땅을 파서 랜덤 획득',
                    'useKo': 'CD 플레이어에 넣어 마을 BGM으로 재생',
                    'sourceUrl': GAME8_CD_SOURCE_URL,
                }
                for name_jp in names
            ]

    texts = body_texts(CD_PAGE)
    names = texts[8:51]
    return [
        {
            'id': slugify(name_jp),
            'nameJp': name_jp,
            'nameKo': ko_name(name_jp, {}, {}, {}),
            'imagePath': image_path_for(name_jp, cd_images) or default_image,
            'obtainJp': '光る地面を掘ってランダム入手',
            'obtainKo': '빛나는 땅을 파서 랜덤 획득',
            'useKo': 'CD 플레이어에 넣어 마을 BGM으로 재생',
            'sourceUrl': CD_SOURCE_URL,
        }
        for name_jp in names
    ]


def parse_all_items(
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    label_ko: dict[str, str],
    item_images: dict[str, ImageEntry],
    item_records: dict[str, GamewithItemRecord],
    favorite_tag_master: dict[str, dict],
    item_tag_ids_by_name_jp: dict[str, set[str]],
    item_tag_ids_by_normalized_name: dict[str, set[str]],
) -> list[dict]:
    if not GAME8_ITEM_PAGE.exists():
        return []

    table = table_at(GAME8_ITEM_PAGE, 1)
    default_image = page_og_image_url(GAME8_ITEM_PAGE)
    entries: list[dict] = []
    for row in table.select('tr')[1:]:
        cells = row.select('td')
        if len(cells) < 3:
            continue

        name_cell, use_cell, category_cell = cells[:3]
        name_jp = name_cell.get_text(' ', strip=True)
        if not name_jp:
            continue

        record = lookup_gamewith_record(name_jp, item_records)
        favorite_tag_ids = lookup_favorite_tag_ids(name_jp, item_tag_ids_by_name_jp, item_tag_ids_by_normalized_name)
        category_jp = category_cell.get_text(' ', strip=True) or (record.category_jp if record else '') or 'その他'
        use_jp = use_cell.get_text(' ', strip=True)
        usage_targets_jp = [link.get_text(' ', strip=True) for link in use_cell.select('a.a-link') if link.get_text(' ', strip=True)]
        image_path = ITEM_IMAGE_OVERRIDES.get(name_jp)
        if image_path is None:
            image_path = record.image_path if record is not None else None
        if image_path is None:
            image_path = image_path_for(name_jp, item_images)
        if image_path is None:
            image_path = extract_remote_image_url(name_cell.select_one('img'))
        if image_path is None:
            image_path = default_image
        item_link = name_cell.select_one('a[href]')

        entries.append(
            {
                'id': stable_id('all-item', name_jp, category_jp, use_jp),
                'nameJp': name_jp,
                'nameKo': translate_name_text(name_jp, pokemon_ko, material_map, label_ko),
                'imagePath': image_path,
                'categoryJp': category_jp,
                'categoryKo': translate_name_text(category_jp, pokemon_ko, material_map, label_ko),
                'useJp': use_jp,
                'useKo': translate_place_text(replace_all(use_jp, ITEM_USE_LABEL_KO), pokemon_ko, material_map, label_ko),
                'usageTargetsJp': usage_targets_jp,
                'usageTargetsKo': [translate_name_text(target, pokemon_ko, material_map, label_ko) for target in usage_targets_jp],
                'favoriteTagIds': favorite_tag_ids,
                'favoriteTagsJp': [favorite_tag_master[tag_id]['nameJp'] for tag_id in favorite_tag_ids if tag_id in favorite_tag_master],
                'favoriteTagsKo': [favorite_tag_master[tag_id]['nameKo'] for tag_id in favorite_tag_ids if tag_id in favorite_tag_master],
                'craftMaterialsJp': [],
                'craftMaterialsKo': [],
                'sourceUrl': absolute_source_url(item_link.get('href') if item_link else None, GAME8_ITEM_SOURCE_URL),
            }
        )

    return entries


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


def parse_ancient_groups(item_images: dict[str, ImageEntry]) -> list[dict]:
    soup = BeautifulSoup(ANCIENT_PAGE.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    tables = soup.select('table')

    big_items: list[dict] = []
    for row in tables[2].select('tr')[1:]:
        cells = row.select('th,td')
        if len(cells) < 2:
            continue
        name_jp = cells[1].get_text(' ', strip=True)
        if not name_jp:
            continue
        big_items.append(
            {
                'number': int(cells[0].get_text(' ', strip=True)),
                'nameJp': name_jp,
                'nameKo': translate_name_text(name_jp, {}, {}, {}),
                'imagePath': extract_remote_image_url(row.select_one('img')) or image_path_for(name_jp, item_images),
            }
        )

    small_items: list[dict] = []
    for row in tables[3].select('tr')[1:]:
        cells = row.select('th,td')
        if len(cells) < 2:
            continue
        name_jp = cells[1].get_text(' ', strip=True)
        if not name_jp:
            continue
        small_items.append(
            {
                'number': int(cells[0].get_text(' ', strip=True)),
                'nameJp': name_jp,
                'nameKo': translate_name_text(name_jp, {}, {}, {}),
                'imagePath': extract_remote_image_url(row.select_one('img')) or image_path_for(name_jp, item_images),
            }
        )

    fossils: list[dict] = []
    for row in tables[4].select('tr')[1:]:
        cells = row.select('th,td')
        if len(cells) < 3:
            continue
        name_jp = cells[1].get_text(' ', strip=True)
        map_jp = cells[2].get_text(' ', strip=True)
        if not name_jp:
            continue
        fossils.append(
            {
                'nameJp': name_jp,
                'nameKo': translate_name_text(name_jp, {}, {}, {}),
                'imagePath': extract_remote_image_url(row.select_one('img')) or image_path_for(name_jp, item_images),
                'mapJp': map_jp,
                'mapKo': MAP_KO.get(map_jp, map_jp),
            }
        )

    return [
        {
            'id': 'large-lost',
            'nameJp': 'おおきなおとしもの',
            'nameKo': MANUAL_KO['おおきなおとしもの'],
            'count': len(big_items),
            'items': big_items,
        },
        {
            'id': 'small-lost',
            'nameJp': 'ちいさなおとしもの',
            'nameKo': MANUAL_KO['ちいさなおとしもの'],
            'count': len(small_items),
            'items': small_items,
        },
        {
            'id': 'fossils',
            'nameJp': 'かせき',
            'nameKo': MANUAL_KO['かせき'],
            'count': len(fossils),
            'items': fossils,
        },
    ]


def build_items_payload(
    site_data: dict,
    label_ko: dict[str, str],
    pokemon_ko: dict[str, str],
    material_map: dict[str, str],
    image_groups: dict[str, dict[str, ImageEntry]],
) -> dict:
    item_records = load_gamewith_item_records(GAMEWITH_ITEMDATA_PAGES)
    recipe_reference_images = load_gamewith_recipe_reference_images(item_records)
    emote_obtain_map = load_emote_obtain_map()
    favorite_tags, pokemon_favorite_tags_by_slug, item_tag_ids_by_name_jp, item_tag_ids_by_normalized_name = build_favorite_tag_payload(site_data)
    favorite_tag_master = {entry['id']: entry for entry in favorite_tags}
    all_items = parse_all_items(
        pokemon_ko,
        material_map,
        label_ko,
        image_groups['item'],
        item_records,
        favorite_tag_master,
        item_tag_ids_by_name_jp,
        item_tag_ids_by_normalized_name,
    )
    resolved_item_images = dict(image_groups['item'])
    resolved_item_images.update(recipe_reference_images)
    for record in item_records.values():
        if record.image_path:
            resolved_item_images.setdefault(record.name_jp, ImageEntry(record.name_jp, None, record.image_path))
    for entry in all_items:
        image_path = entry.get('imagePath')
        if image_path:
            resolved_item_images.setdefault(entry['nameJp'], ImageEntry(entry['nameJp'], entry.get('nameKo'), image_path))

    shop_recipes, other_recipes = parse_recipe_data(pokemon_ko, material_map, label_ko, image_groups['recipe'], resolved_item_images)
    buildings = parse_buildings(label_ko, pokemon_ko, material_map, image_groups['building'], resolved_item_images, all_items)
    dolls = parse_dolls(pokemon_ko, material_map, image_groups['doll'], resolved_item_images)
    berries = parse_berries(image_groups['berry'], resolved_item_images)
    emotes = parse_emotes(image_groups['emote'], emote_obtain_map)
    bestshots = parse_bestshots(pokemon_ko, material_map, label_ko, image_groups['bestshot'])
    cds = parse_cds(image_groups['cd'], resolved_item_images)
    special_collections = parse_special_collections(image_groups)
    ancient_groups = parse_ancient_groups(resolved_item_images)

    return {
        'sourceUrls': [
            RECIPE_SOURCE_URL,
            BUILDING_SOURCE_URL,
            PLUSH_SOURCE_URL,
            CD_SOURCE_URL,
            GAME8_ITEM_SOURCE_URL,
            GAME8_RECIPE_SOURCE_URL,
            GAME8_EMOTE_SOURCE_URL,
            GAME8_BESTSHOT_SOURCE_URL,
            GAME8_CD_SOURCE_URL,
            BERRY_SOURCE_URL,
            EMOTE_SOURCE_URL,
            BESTSHOT_SOURCE_URL,
            MURAL_SOURCE_URL,
            SLATE_SOURCE_URL,
            ANCIENT_SOURCE_URL,
        ],
        'summary': {
            'itemCount': len(all_items),
            'favoriteTagCount': len(favorite_tags),
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
                'Game8와 기존 원본 캐시를 함께 써서 전체 아이템 목록과 누락된 감정표현, 베스트샷을 보강했다',
                '이미지 소스가 확인된 레시피, 건물, 인형, CD, 고대의 물건은 아이콘을 함께 표시한다',
                '아이템명은 인게임 확인 재료명과 확보한 한국어 표기를 우선 반영했다',
            ],
        },
        'favoriteTags': favorite_tags,
        'pokemonFavoriteTagsBySlug': pokemon_favorite_tags_by_slug,
        'allItems': all_items,
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

    dream_islands, dream_dolls, dream_summary = parse_dream_islands(pokemon_ko, material_map, image_groups['doll'])
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
    cooking_payload = parse_cooking(label_ko, pokemon_ko, image_groups['item'])
    items_payload = build_items_payload(site_data, label_ko, pokemon_ko, material_map, image_groups)

    write_json(OUTPUT_DIR / 'dream-data.json', dream_payload)
    write_json(OUTPUT_DIR / 'cooking-data.json', cooking_payload)
    write_json(OUTPUT_DIR / 'items-data.json', items_payload)

    print('Generated dream-data.json:', len(dream_payload['islands']), 'islands /', len(dream_payload['dolls']), 'dolls')
    print('Generated cooking-data.json:', len(cooking_payload['dishes']), 'dishes')
    print('Generated items-data.json:', items_payload['summary']['recipeCount'], 'recipes /', items_payload['summary']['ancientItemCount'], 'ancient items')


if __name__ == '__main__':
    main()
