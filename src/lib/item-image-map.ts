import itemsDataJson from '@/data/items-data.json';

// allItems에서 nameKo/nameJp → imagePath 자동 빌드
const _itemImageMap = new Map<string, string>();
for (const item of (itemsDataJson as { allItems: { nameKo: string; nameJp: string; imagePath: string | null }[] }).allItems) {
  if (item.imagePath) {
    if (item.nameKo) _itemImageMap.set(item.nameKo, item.imagePath);
    _itemImageMap.set(item.nameJp, item.imagePath);
  }
}

// allItems에 없는 서식지 전용 아이템 보충
const _GW = 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha';
const _supplementary: Record<string, string> = {
  '가로등': `${_GW}/item_36.png`,
  '개구리밥': `${_GW}/item_125.png`,
  '꽃 배낭': `${_GW}/item_636.png`,
  '꽃 식기 세트': `${_GW}/item_629.png`,
  '꽃 쿠션': `${_GW}/item_631.png`,
  '노란 풀': `${_GW}/item_110.png`,
  '도시락': `${_GW}/item_634.png`,
  '들판 꽃': `${_GW}/item_15.png`,
  '바위 지대 꽃': `${_GW}/item_123.png`,
  '분홍 풀': `${_GW}/item_403.png`,
  '빨간 풀': `${_GW}/item_121.png`,
  '세모난 나무': `${_GW}/item_122.png`,
  '이끼': `${_GW}/item_126.png`,
  '이끼 바위': `${_GW}/item_127.png`,
  '저주받은 갑옷': `${_GW}/item_300.png`,
  '초록 풀': `${_GW}/item_6.png`,
  '축복받은 갑옷': `${_GW}/item_299.png`,
  '큰 야자나무': `${_GW}/item_112.png`,
  '큰 돌': `${_GW}/item_97.png`,
  '통통코 물통': `${_GW}/item_633.png`,
  '평온한 꽃': `${_GW}/item_628.png`,
  '프라이팬': `${_GW}/item_156.png`,
  '해변 꽃': `${_GW}/item_111.png`,
  '화장대': `${_GW}/item_495.png`,
  '부유섬의 꽃': `${_GW}/item_396.png`,
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
  '의자': `${_GW}/item_101.png`,
  '의자(긴 것)': `${_GW}/item_432.png`,
  '침대': `${_GW}/item_11.png`,
  '테이블': `${_GW}/item_49.png`,
  '테이블(큰 것)': `${_GW}/item_8.png`,
  '인형': `${_GW}/item_54.png`,
  '옷장': `${_GW}/item_472.png`,
  '받침대': `${_GW}/item_139.png`,
  '거울(큰 것)': `${_GW}/item_26.png`,
  '나무 길': `${_GW}/item_64.png`,
  '접시에 올린 음식': `${_GW}/item_325.png`,
  '간판': `${_GW}/item_38.png`,
  '쓰레기통': `${_GW}/item_117.png`,
};
for (const [name, url] of Object.entries(_supplementary)) {
  if (!_itemImageMap.has(name)) _itemImageMap.set(name, url);
}

/** 아이템/재료 이름으로 이미지 URL 반환 (allItems 기반 자동 조회) */
export function getItemImageFromMap(name: string): string | null {
  const clean = name.replace(/\s*[×x]\s*\d+$/i, '').trim();
  if (_itemImageMap.has(clean)) return _itemImageMap.get(clean)!;
  const withoutAny = clean.replace(/\(아무거나\)$/, '').replace(/\(큰 것\)$/, '').replace(/\(긴 것\)$/, '').trim();
  if (withoutAny !== clean && _itemImageMap.has(withoutAny)) return _itemImageMap.get(withoutAny)!;
  return null;
}
