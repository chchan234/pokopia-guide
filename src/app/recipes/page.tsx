import { Suspense } from 'react';
import type { Metadata } from 'next';
import RecipesPageClient from '@/components/recipes-page-client';
import { itemsGuideData } from '@/lib/data';
import type { RecipeEntry } from '@/types/pokemon';

export const metadata: Metadata = {
  title: '레시피 | pokowiki',
  description: '레시피 제작 목록과 재료를 확인하세요.',
};

export interface RecipeEntryWithSource extends RecipeEntry {
  sourceLabel: '상점' | '기타';
}

export default function RecipesPage() {
  const shopRecipes: RecipeEntryWithSource[] = itemsGuideData.recipes.shop.map((r) => ({
    ...r,
    sourceLabel: '상점' as const,
  }));
  const otherRecipes: RecipeEntryWithSource[] = itemsGuideData.recipes.other.map((r) => ({
    ...r,
    sourceLabel: '기타' as const,
  }));
  const recipes = [...shopRecipes, ...otherRecipes];

  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
          레시피 데이터를 불러오는 중입니다.
        </div>
      }
    >
      <RecipesPageClient recipes={recipes} />
    </Suspense>
  );
}
