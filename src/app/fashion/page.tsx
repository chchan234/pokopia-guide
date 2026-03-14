import { Suspense } from 'react';
import FashionPageClient from '@/components/fashion-page-client';
import { fashionCategoryOrder } from '@/lib/constants';
import { fashionCategories } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '의상 | pokowiki',
  description: '포코피아 의상, 헤어, 코디 세트의 이미지와 해금 기록을 연결했습니다.',
};

export default function FashionPage() {
  const categories = fashionCategoryOrder
    .map((key) => fashionCategories.find((category) => category.key === key))
    .filter((category): category is NonNullable<typeof category> => Boolean(category));
  return (
    <Suspense fallback={<div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">의상 목록을 불러오는 중입니다.</div>}>
      <FashionPageClient categories={categories} />
    </Suspense>
  );
}
