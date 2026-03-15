'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ShowcaseIsland {
  id: string;
  title: string;
  description: string;
  author: string;
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
        <h1 className="text-2xl font-extrabold text-foreground">섬 꾸미기 갤러리</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          유저들의 멋진 섬 꾸미기 모음입니다. 이미지를 클릭하면 크게 볼 수 있습니다.
        </p>
      </div>

      {islands.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">아직 등록된 섬이 없습니다.</div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 xl:columns-4">
          {islands.map((island) => (
            <button
              key={island.id}
              type="button"
              onClick={() => setSelected(island)}
              className="mb-3 block w-full overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-pk-green"
            >
              <Image
                src={island.imagePath}
                alt={island.title}
                width={400}
                height={300}
                className="w-full object-cover"
                unoptimized
              />
              <div className="px-3 py-2 text-left">
                <p className="text-sm font-semibold text-foreground">{island.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{island.author}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-4xl overflow-auto rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
              <div>
                <p className="font-bold text-foreground">{selected.title}</p>
                <p className="text-xs text-muted-foreground">{selected.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground hover:opacity-80"
                >
                  원본
                </a>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full bg-foreground px-3 py-1.5 text-sm font-semibold text-background hover:opacity-80"
                >
                  닫기
                </button>
              </div>
            </div>
            <div className="p-3">
              <Image
                src={selected.imagePath}
                alt={selected.title}
                width={1200}
                height={900}
                className="w-full rounded-xl object-contain"
                unoptimized
              />
              {selected.description && (
                <p className="mt-3 text-sm text-muted-foreground">{selected.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
