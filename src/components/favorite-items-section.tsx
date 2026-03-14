'use client';

import { useState } from 'react';
import Image from 'next/image';
import favoriteTagsData from '@/data/favorite-tags-data.json';

interface FavoriteItemsSectionProps {
  favoriteItems: string[];
  favoriteItemsNote: string | null;
  favoriteItemVariants: string[][];
  extraMaterials: string[];
  slug: string;
}

interface TagItem {
  nameJp: string;
  nameKo: string;
  imagePath: string | null;
}

interface TagData {
  nameJp: string;
  items: TagItem[];
}

const tagsData = favoriteTagsData as Record<string, TagData>;

export default function FavoriteItemsSection({
  favoriteItems,
  favoriteItemsNote,
  favoriteItemVariants,
  extraMaterials,
  slug,
}: FavoriteItemsSectionProps) {
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  if (favoriteItems.length === 0 && !favoriteItemsNote && favoriteItemVariants.length === 0 && extraMaterials.length === 0) {
    return null;
  }

  function handleTagClick(tag: string) {
    if (!tagsData[tag]) return;
    setExpandedTag(expandedTag === tag ? null : tag);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg font-bold text-foreground">좋아하는 것</h2>

      {favoriteItems.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {favoriteItems.map((item) => {
            const hasData = Boolean(tagsData[item]?.items.length);
            const isExpanded = expandedTag === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleTagClick(item)}
                disabled={!hasData}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  isExpanded
                    ? 'bg-pk-green text-white'
                    : hasData
                      ? 'bg-pk-green-light text-pk-green-dark hover:bg-pk-green hover:text-white'
                      : 'bg-pk-green-light text-pk-green-dark'
                } ${hasData ? 'cursor-pointer' : ''}`}
              >
                {item}
                {hasData && (
                  <span className="ml-1 opacity-60">{tagsData[item].items.length}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 태그 클릭 시 가구 목록 표시 */}
      {expandedTag && tagsData[expandedTag] && (
        <div className="mt-4 rounded-2xl border border-pk-green/20 bg-pk-green-light/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-pk-green-dark">
              &apos;{expandedTag}&apos; 해당 아이템 {tagsData[expandedTag].items.length}개
            </p>
            <button
              type="button"
              onClick={() => setExpandedTag(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              닫기
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {tagsData[expandedTag].items.map((tagItem) => (
              <div
                key={tagItem.nameJp}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-2"
              >
                {tagItem.imagePath && (
                  <Image
                    src={tagItem.imagePath}
                    alt={tagItem.nameKo}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-lg object-contain"
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                  {tagItem.nameKo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {favoriteItemsNote && <p className="mt-4 text-sm text-muted-foreground">{favoriteItemsNote}</p>}

      {favoriteItemVariants.length > 0 && (
        <div className="mt-4 space-y-3">
          {favoriteItemVariants.map((variantItems, index) => (
            <div key={`${slug}-fav-${index}`} className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">형태 {index + 1}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {variantItems.map((item) => (
                  <span key={`${slug}-${index}-${item}`} className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {extraMaterials.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-muted-foreground">어지르기 추가 재료</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {extraMaterials.map((item) => (
              <span key={`${slug}-extra-${item}`} className="rounded-full bg-pk-brown-light px-3 py-1 text-xs font-semibold text-pk-brown-dark">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
