// 재료 한국어 이름 → 아이콘 이미지 URL 매핑
const materialImageMap: Record<string, string> = {
  '돌': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_5.png',
  '잎사귀': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_3.png',
  '목재': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_2.png',
  '실뭉치': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_52.png',
  '솜': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_376.png',
  '철 주괴': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_94.png',
  '포케메탈': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_78.png',
  '유리': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_214.png',
  '작은 통나무': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_1.png',
  '구리 주괴': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_93.png',
  '금 주괴': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_197.png',
  '튼튼한 나뭇가지': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_4.png',
  '덩굴 끈': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_48.png',
  '말랑말랑 점토': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_215.png',
  '종이': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_427.png',
  '벽돌': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_201.png',
  '철': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_35.png',
  '콘크리트': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_221.png',
  '크리스탈 조각': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_170.png',
  '씨글라스 조각': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_200.png',
  '대형 기어': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_301.png',
  '종이 쓰레기': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_368.png',
  '불연성 쓰레기': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_397.png',
  '신비한 줄': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_399.png',
  '갑옷 파편': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_165.png',
  '조개껍데기': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_369.png',
  '빛나는 버섯': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_223.png',
  '바닷가 모래': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_442.png',
  '화산재': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_508.png',
  '빛의돌': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_224.png',
  '들판의 꽃': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_15.png',
  '로즈레이 차': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_685.png',
  '모몬열매': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_609.png',
  '카고열매': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_607.png',
  '치고열매': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_608.png',
  '나나시열매': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_610.png',
  '람열매': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_611.png',
  '열매·히메리': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_16.png',
  '얼음': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_172.png',
  '물감·분홍': 'https://img.gamewith.jp/img/04760a9afd819bb9ef9f3bfec97538b3.png',
  '물감·하늘색': 'https://img.gamewith.jp/img/9a776829256355021e7fc1d4ed7a5cc3.png',
  '해변 모래': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_442.png',
  '마그마 바위': 'https://img.game8.jp/12374394/d629bc2cd8872af063bb854c578249f7.webp/original',
  // 실 부스러기는 실뭉치 이미지와 동일
  '실 부스러기': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_52.png',
  '튼튼한 가지': 'https://img.gamewith.jp/article_tools/pocoapokemon/gacha/item_4.png',
};

/** 재료 텍스트에서 이름 부분만 추출 (수량 제거) */
function extractMaterialName(material: string): string {
  return material.replace(/\s*[×x]\s*\d+$/i, '').trim();
}

/** 재료 이름으로 이미지 URL 반환 (없으면 null) */
export function getMaterialImage(material: string): string | null {
  const name = extractMaterialName(material);
  return materialImageMap[name] ?? null;
}
