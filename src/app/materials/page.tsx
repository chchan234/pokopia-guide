import { Suspense } from 'react';
import type { Metadata } from 'next';
import MaterialsPageClient from '@/components/materials-page-client';
import { cookingGuideData, habitats, itemsGuideData } from '@/lib/data';
import type { MaterialUsage, MaterialUsageEntry } from '@/types/pokemon';

export const metadata: Metadata = {
  title: '재료 검색 | pokowiki',
  description: '재료 이름으로 요리, 서식지, 건축물 등 사용처를 역방향 검색합니다.',
};

function buildMaterialMap(): MaterialUsage[] {
  const map = new Map<string, { displayName: string; usages: MaterialUsageEntry[] }>();

  function add(material: string, entry: MaterialUsageEntry) {
    if (material === '아무거나' || material === 'なんでも') return;
    const key = material.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.usages.push(entry);
    } else {
      map.set(key, { displayName: material, usages: [entry] });
    }
  }

  // 요리 재료
  for (const dish of cookingGuideData.dishes) {
    const dishName = dish.nameKo || dish.nameJp;
    const tool = dish.toolKo || dish.toolJp;
    const entry: MaterialUsageEntry = {
      category: 'cooking',
      categoryLabel: '요리',
      name: dishName,
      detail: `${tool} · ${dish.boostedSkillKo || dish.boostedSkillJp}`,
      href: `/cooking?q=${encodeURIComponent(dishName)}`,
      imagePath: dish.imagePath,
    };
    for (const mat of dish.materialsKo) {
      add(mat, entry);
    }
  }

  // 서식지 재료
  for (const habitat of habitats) {
    if (habitat.requirementsKo.length === 0) continue;
    const label = habitat.number ? `No.${habitat.number} ` : habitat.isEvent ? '이벤트 ' : '';
    const entry: MaterialUsageEntry = {
      category: 'habitat',
      categoryLabel: '서식지',
      name: `${label}${habitat.name}`,
      detail: habitat.mapNames.join(' · ') || '미상',
      href: `/habitats/${habitat.id}`,
      imagePath: habitat.imagePath,
    };
    for (const mat of habitat.requirementsKo) {
      add(mat, entry);
    }
  }

  // 건축 재료
  for (const building of itemsGuideData.buildings) {
    if (building.requiredMaterialsKo.length === 0) continue;
    const buildingName = building.nameKo || building.nameJp;
    const entry: MaterialUsageEntry = {
      category: 'building',
      categoryLabel: '건축',
      name: buildingName,
      detail: building.useKo || building.useJp || '',
      href: `/items?tab=buildings&q=${encodeURIComponent(buildingName)}`,
      imagePath: building.imagePath,
    };
    for (const mat of building.requiredMaterialsKo) {
      const cleanMat = mat.replace(/\s*[×x]\s*\d+$/i, '').trim();
      add(cleanMat, entry);
    }
  }

  return Array.from(map.values())
    .map(({ displayName, usages }) => ({ material: displayName, usages }))
    .sort((a, b) => a.material.localeCompare(b.material, 'ko'));
}

export default function MaterialsPage() {
  const materials = buildMaterialMap();

  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">재료 데이터를 불러오는 중입니다.</div>}>
      <MaterialsPageClient materials={materials} />
    </Suspense>
  );
}
