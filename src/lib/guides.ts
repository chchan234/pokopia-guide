export interface GuideSource {
  site: 'Game8' | 'GameWith';
  title: string;
  href: string;
  note: string;
}

export interface GuideSection {
  title: string;
  summary?: string;
  bullets: string[];
}

export interface GuideDoc {
  slug: string;
  title: string;
  shortDescription: string;
  heroSummary: string;
  statusLabel: string;
  keyPoints: string[];
  sections: GuideSection[];
  sources: GuideSource[];
  relatedRoutes: Array<{ label: string; href: string }>;
  searchTerms: string[];
}

export const guideDocs: GuideDoc[] = [
  {
    slug: 'story',
    title: '스토리 / 해금 공략',
    shortDescription: '마을 진행 순서, 중요 요청, 포켓몬센터 복구, 클리어 후 해금을 한 화면으로 묶는 공략 페이지',
    heroSummary:
      '지금 사이트에서 가장 부족한 부분은 진행 흐름입니다. 이 문서는 “지금 뭘 해야 하는지”를 빠르게 확인하는 용도로 잡습니다.',
    statusLabel: '1차 초안',
    keyPoints: ['진행 순서', '기능 해금', '중요 요청', '클리어 후 열리는 요소'],
    sections: [
      {
        title: '핵심 구성',
        bullets: [
          '마을별 메인 진행 순서를 체크리스트로 정리',
          '포켓몬센터 복구, 이동 수단, 새로운 제작 기능처럼 진행을 막는 해금 요소를 별도 카드로 분리',
          '중요 요청은 “언제 열리는지 / 보상 / 연결 기능”을 같이 표기',
        ],
      },
      {
        title: '기존 탭과 연결',
        bullets: [
          '요청 보상에서 기록, 의상, 아이템 페이지로 바로 이동',
          '진행 중 열리는 서식지는 서식지 상세로 연결',
          '꿈섬, 요리, 건축 기능이 언제 열리는지도 같이 표기',
        ],
      },
      {
        title: '우선 넣을 데이터',
        bullets: [
          '메마른 황야 마을부터 반짝반짝 부유섬 마을까지 메인 스토리 차트',
          '중요 요청 목록과 선행 조건',
          '클리어 후 열리는 기능과 해금 순서',
        ],
      },
    ],
    sources: [
      {
        site: 'Game8',
        title: '스토리 차트',
        href: 'https://game8.jp/pocoapokemon/767282',
        note: '메인 진행 순서와 지역 해금 흐름 확인용',
      },
      {
        site: 'Game8',
        title: '메인 공략 허브',
        href: 'https://game8.jp/pocoapokemon',
        note: '중요 요청, 해금 요소, 서브 가이드 진입점',
      },
      {
        site: 'GameWith',
        title: '스토리 차트',
        href: 'https://gamewith.jp/pocoapokemon/545736',
        note: 'Game8과 대조해서 누락 단계 보완',
      },
      {
        site: 'GameWith',
        title: '클리어 후 해금 요소',
        href: 'https://gamewith.jp/pocoapokemon/547640',
        note: '엔드게임 진입 후 추가 기능 정리',
      },
    ],
    relatedRoutes: [
      { label: '기록', href: '/records' },
      { label: '서식지', href: '/habitats' },
      { label: '꿈섬', href: '/dream-islands' },
    ],
    searchTerms: ['스토리', '진행', '해금', '요청', '클리어 후', '포켓몬센터'],
  },
  {
    slug: 'beginner',
    title: '초보자 팁',
    shortDescription: '초반 우선순위, 매일 할 것, 놓치기 쉬운 요소를 빠르게 보는 입문 가이드',
    heroSummary:
      '검색 유입이 가장 잘 붙는 영역입니다. 첫날 할 일과 매일 체크할 루틴이 정리되면, 사이트를 처음 보는 사람도 바로 쓸 수 있습니다.',
    statusLabel: '1차 초안',
    keyPoints: ['초반 우선순위', '데일리 루틴', '놓치기 쉬운 것', '효율 팁'],
    sections: [
      {
        title: '핵심 구성',
        bullets: [
          '첫 1시간에 해야 할 일, 첫 마을 정리, 제작 해금 순서를 짧게 정리',
          '매일 체크할 것과 주간처럼 챙길 요소를 한 카드에 묶기',
          '되돌릴 수 없는 요소나 초반에 낭비하기 쉬운 자원 경고를 별도 박스로 표시',
        ],
      },
      {
        title: '기존 탭과 연결',
        bullets: [
          '재료 수급 팁에서 아이템/재료 검색으로 이동',
          '좋아하는 환경과 집 추천을 언제부터 활용하면 좋은지 연결',
          '의상, 기록, 꿈섬은 어떤 시점부터 챙기면 좋은지 가이드에 포함',
        ],
      },
      {
        title: '우선 넣을 데이터',
        bullets: [
          '초반 추천 행동 순서',
          '매일 할 일 체크리스트',
          '놓치기 쉬운 요소와 회수 타이밍',
        ],
      },
    ],
    sources: [
      {
        site: 'Game8',
        title: '초보자 팁',
        href: 'https://game8.jp/pocoapokemon/767321',
        note: '초반 진행 팁과 추천 행동 확인용',
      },
      {
        site: 'Game8',
        title: '매일 할 것',
        href: 'https://game8.jp/pocoapokemon/767308',
        note: '데일리 루틴 체크리스트용',
      },
      {
        site: 'Game8',
        title: '놓치면 안 되는 요소',
        href: 'https://game8.jp/pocoapokemon/767517',
        note: '되돌릴 수 없는 요소 정리용',
      },
      {
        site: 'GameWith',
        title: '놓치면 안 되는 요소',
        href: 'https://gamewith.jp/pocoapokemon/545252',
        note: 'Game8과 교차 검증용',
      },
    ],
    relatedRoutes: [
      { label: '재료 검색', href: '/materials' },
      { label: '아이템', href: '/items' },
      { label: '내 수집', href: '/collection' },
    ],
    searchTerms: ['초보자', '팁', '데일리', '매일', '놓치기 쉬운 것', '효율'],
  },
  {
    slug: 'building',
    title: '건축 / 환경 가이드',
    shortDescription: '서식지 만드는 법, 집 짓기, 환경 레벨, 건축 키트를 공략 관점으로 묶는 페이지',
    heroSummary:
      '우리 사이트의 집 추천과 가장 잘 붙는 공략입니다. 도감 정보만으로 끝내지 않고 실제 배치와 점수로 이어지는 길을 만들어 줍니다.',
    statusLabel: '1차 초안',
    keyPoints: ['서식지 만드는 법', '환경 레벨', '집 짓기', '건축 키트'],
    sections: [
      {
        title: '핵심 구성',
        bullets: [
          '환경 레벨과 주거도를 올리는 기본 원칙을 먼저 설명',
          '서식지 제작은 필요한 지형, 오브젝트, 필수 재료를 단계형으로 정리',
          '건축 키트와 발전 시설은 입수처와 쓰임새를 묶어서 표로 제공',
        ],
      },
      {
        title: '기존 탭과 연결',
        bullets: [
          '서식지 가이드 카드에서 서식지 상세와 바로 연결',
          '건축 재료가 필요한 항목은 재료 검색으로 바로 이동',
          '좋아하는 환경을 맞춘 다음 집 추천으로 연결되는 동선을 제공',
        ],
      },
      {
        title: '우선 넣을 데이터',
        bullets: [
          '서식지 만드는 법 기본 규칙',
          '환경 레벨 올리는 핵심 요소',
          '대표 건축 키트와 발전 시설 목록',
        ],
      },
    ],
    sources: [
      {
        site: 'Game8',
        title: '포켓몬 출현 조건 / 서식지 만드는 법',
        href: 'https://game8.jp/pocoapokemon/768257',
        note: '환경 조건과 출현 규칙 확인용',
      },
      {
        site: 'Game8',
        title: '환경 레벨 올리는 법',
        href: 'https://game8.jp/pocoapokemon/767551',
        note: '점수와 해금 조건 정리용',
      },
      {
        site: 'GameWith',
        title: '건축 맵/건물 허브',
        href: 'https://gamewith.jp/pocoapokemon/545502',
        note: '건축 관련 문서 모음 허브',
      },
      {
        site: 'GameWith',
        title: '건축 키트 예시',
        href: 'https://gamewith.jp/pocoapokemon/548700',
        note: '건물 개별 데이터와 입수처 확인용',
      },
    ],
    relatedRoutes: [
      { label: '서식지', href: '/habitats' },
      { label: '재료 검색', href: '/materials' },
      { label: '집 추천', href: '/house-planner' },
    ],
    searchTerms: ['건축', '환경', '서식지 만드는 법', '주거도', '환경 레벨', '집 짓기'],
  },
  {
    slug: 'events',
    title: '이벤트',
    shortDescription: '현재 진행 중 이벤트, 기간, 교환 보상, 출현 포켓몬을 정리할 페이지',
    heroSummary:
      '이벤트는 최신성 때문에 재방문 이유가 생깁니다. 공략 허브 안에서도 가장 업데이트 주기가 잦은 영역으로 따로 분리하는 편이 맞습니다.',
    statusLabel: '1차 초안',
    keyPoints: ['현재 이벤트', '기간', '보상', '출현 포켓몬'],
    sections: [
      {
        title: '핵심 구성',
        bullets: [
          '현재 진행 이벤트를 상단에 카드 한 장으로 바로 노출',
          '기간, 목표 재화, 교환 보상을 같은 블록에서 확인 가능하게 구성',
          '이벤트 전용 출현 포켓몬과 보상은 도감/아이템/의상으로 바로 연결',
        ],
      },
      {
        title: '운영 방식',
        bullets: [
          '이벤트가 없을 때는 지난 이벤트 기록만 보이게 처리',
          '이벤트 기간은 반드시 절대 날짜로 표시',
          '이벤트별 핵심 체크 포인트를 3줄 내외로 정리',
        ],
      },
      {
        title: '우선 넣을 데이터',
        bullets: [
          '현재 이벤트 목록과 기간',
          '교환 보상과 우선순위',
          '이벤트 전용 출현 포켓몬과 관련 아이템',
        ],
      },
    ],
    sources: [
      {
        site: 'Game8',
        title: '이벤트 목록',
        href: 'https://game8.jp/pocoapokemon/767520',
        note: '진행 중/종료 이벤트 분류 확인용',
      },
      {
        site: 'Game8',
        title: '현재 이벤트 예시',
        href: 'https://game8.jp/pocoapokemon/768347',
        note: '이벤트 카드 구성 예시',
      },
      {
        site: 'GameWith',
        title: '이벤트 페이지',
        href: 'https://gamewith.jp/pocoapokemon/547187',
        note: '기간과 보상 교차 검증용',
      },
      {
        site: 'GameWith',
        title: '메인 공략 허브',
        href: 'https://gamewith.jp/pocoapokemon/',
        note: '최신 공지와 관련 가이드 진입점',
      },
    ],
    relatedRoutes: [
      { label: '포켓몬', href: '/pokemon' },
      { label: '아이템', href: '/items' },
      { label: '의상', href: '/fashion' },
    ],
    searchTerms: ['이벤트', '기간', '보상', '교환', '출현 포켓몬', '최신'],
  },
];

export function getGuideDoc(slug: string) {
  return guideDocs.find((entry) => entry.slug === slug);
}
