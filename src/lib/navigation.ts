export interface NavigationChild {
  href: string;
  label: string;
  description?: string;
}

export interface NavigationGroup {
  key: string;
  label: string;
  href: string;
  description: string;
  children: NavigationChild[];
}

export interface HomeQuickLink extends NavigationChild {
  groupLabel: string;
}

export const navigationGroups: NavigationGroup[] = [
  {
    key: 'pokemon',
    label: '포켓몬',
    href: '/pokemon',
    description: '도감 · 서식지 · 특기',
    children: [
      { href: '/pokemon', label: '포켓몬', description: '포켓몬 목록과 필터' },
      { href: '/habitats', label: '서식지', description: '출현 서식지와 재료' },
      { href: '/specialties', label: '특기', description: '특기별 포켓몬 묶음' },
    ],
  },
  {
    key: 'craft',
    label: '아이템',
    href: '/items',
    description: '아이템 · 요리',
    children: [
      { href: '/items', label: '아이템', description: '재료와 제작 관련 데이터' },
      { href: '/cooking', label: '요리', description: '요리와 공물 효과' },
      { href: '/materials', label: '재료 검색', description: '재료로 사용처 역검색' },
    ],
  },
  {
    key: 'archive',
    label: '수집',
    href: '/records',
    description: '기록 · 의상 · 꿈섬',
    children: [
      { href: '/records', label: '기록', description: '인간의 기록과 보상' },
      { href: '/fashion', label: '의상', description: '의상·헤어·코디 세트' },
      { href: '/dream-islands', label: '꿈섬', description: '인형과 꿈섬 연결' },
    ],
  },
  {
    key: 'my-data',
    label: '내 데이터',
    href: '/collection',
    description: '내 수집 · 집 추천',
    children: [
      { href: '/collection', label: '내 수집', description: '보유 체크와 진행률' },
      { href: '/house-planner', label: '집 추천', description: '환경별 4마리 배치' },
    ],
  },
  {
    key: 'guides',
    label: '공략',
    href: '/guides',
    description: '스토리 · 팁 · 건축 · 이벤트',
    children: [
      { href: '/guides', label: '공략 허브', description: '추가할 공략 문서 모음' },
      { href: '/guides/story', label: '스토리/해금', description: '진행 순서와 요청 해금' },
      { href: '/guides/beginner', label: '초보자 팁', description: '데일리와 놓치기 쉬운 것' },
      { href: '/guides/building', label: '건축/환경', description: '집 짓기와 서식지 세팅' },
      { href: '/guides/events', label: '이벤트', description: '기간, 보상, 진행 포인트' },
    ],
  },
];

export const homeQuickLinks: HomeQuickLink[] = [
  { groupLabel: '포켓몬', href: '/pokemon', label: '포켓몬', description: '포켓몬 목록과 필터' },
  { groupLabel: '포켓몬', href: '/habitats', label: '서식지', description: '출현 서식지와 재료' },
  { groupLabel: '수집', href: '/records', label: '기록', description: '인간의 기록과 보상' },
  { groupLabel: '수집', href: '/fashion', label: '의상', description: '의상·헤어·코디 세트' },
  { groupLabel: '아이템', href: '/items', label: '아이템', description: '재료와 제작 관련 데이터' },
  { groupLabel: '아이템', href: '/cooking', label: '요리', description: '요리와 공물 효과' },
  { groupLabel: '공략', href: '/guides', label: '공략 허브', description: '스토리, 팁, 건축, 이벤트' },
  { groupLabel: '공략', href: '/guides/story', label: '스토리/해금', description: '진행 순서와 요청 해금' },
  { groupLabel: '공략', href: '/guides/events', label: '이벤트', description: '현재 이벤트와 기간' },
  { groupLabel: '내 데이터', href: '/collection', label: '내 수집', description: '보유 체크와 진행률' },
];
