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
      { href: '/bestshots', label: '베스트샷', description: '사진 수집 조건과 보상' },
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
];

export const homeNavigationSections: Array<{
  title: string;
  description: string;
  groupKeys: string[];
}> = [
  {
    title: '바로 찾기',
    description: '도감과 제작 데이터를 빠르게 찾기',
    groupKeys: ['pokemon', 'craft'],
  },
  {
    title: '수집 정리',
    description: '기록, 의상, 꿈섬 자료 확인',
    groupKeys: ['archive'],
  },
  {
    title: '내 데이터',
    description: '보유 현황과 집 추천',
    groupKeys: ['my-data'],
  },
];
