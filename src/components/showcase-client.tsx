'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ShowcaseIsland {
  id: string;
  title: string;
  description: string;
  author: string;
  authorName: string;
  tweetText: string;
  sourceUrl: string;
  imagePath: string;
}

interface ShowcaseClientProps {
  islands: ShowcaseIsland[];
}

export default function ShowcaseClient({ islands }: ShowcaseClientProps) {
  const [selected, setSelected] = useState<ShowcaseIsland | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">섬꾸</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          이미지를 클릭하면 크게 볼 수 있습니다.
        </p>
      </div>

      {islands.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">아직 등록된 섬이 없습니다.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {islands.map((island) => (
            <button
              key={island.id}
              type="button"
              onClick={() => setSelected(island)}
              className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-pk-green"
            >
              <div className="relative aspect-video w-full bg-muted">
                <Image
                  src={island.imagePath}
                  alt={island.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="px-3 py-2 text-left">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{island.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{island.author}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 모달 - 디시 스타일 */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-3xl overflow-auto rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <div className="sticky top-0 z-10 flex justify-end border-b border-border bg-card/95 px-4 py-2 backdrop-blur">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground hover:opacity-80"
              >
                닫기
              </button>
            </div>

            {/* 이미지 */}
            <div className="bg-black">
              <Image
                src={selected.imagePath}
                alt={selected.title}
                width={1200}
                height={900}
                className="mx-auto max-h-[60dvh] w-auto object-contain"
                unoptimized
              />
            </div>

            {/* 출처 + 트윗 카드 */}
            <div className="space-y-3 p-4">
              {/* 출처 링크 */}
              <p className="text-sm text-muted-foreground">
                출처:{' '}
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pk-green-dark underline underline-offset-2 hover:opacity-80"
                >
                  {selected.sourceUrl}
                </a>
              </p>

              {/* 트윗 카드 */}
              <a
                href={selected.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  {/* X 로고 */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-foreground">{selected.authorName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{selected.author}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{selected.tweetText}</p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
