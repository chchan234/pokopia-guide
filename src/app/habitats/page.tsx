import Link from 'next/link';
import CollectionToggleButton from '@/components/collection-toggle-button';
import ZoomableImage from '@/components/zoomable-image';
import { habitats } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서식지 | pokowiki',
  description: '포코피아 서식지 212개를 이미지와 연결 포켓몬 기준으로 정리한 페이지입니다.',
};

export default function HabitatsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">서식지</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          총 {habitats.length}개 서식지 · 이미지와 포켓몬 매칭을 원본 데이터 기준으로 정리
        </p>
        <p className="mt-1 text-sm text-pk-brown-dark/80">서식지 사진을 클릭하면 확대해서 볼 수 있습니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {habitats.map((habitat) => (
          <section key={habitat.id} id={habitat.id} className="scroll-mt-20 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex gap-4 p-5">
              <div className="flex h-[96px] w-[96px] flex-shrink-0 items-center justify-center rounded-2xl bg-pk-green-light/40">
                {habitat.imagePath ? (
                  <ZoomableImage
                    src={habitat.imagePath}
                    alt={habitat.name}
                    width={84}
                    height={84}
                    className="object-contain"
                    buttonClassName="inline-flex cursor-zoom-in items-center justify-center"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground sm:text-[11px]">이미지 없음</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {habitat.number && <p className="mono text-xs text-muted-foreground sm:text-[11px]">No.{habitat.number}</p>}
                    {!habitat.number && habitat.isEvent && <p className="text-xs font-semibold text-muted-foreground sm:text-[11px]">이벤트 서식지</p>}
                    <Link href={`/habitats/${habitat.id}`} className="text-base font-bold text-foreground hover:text-pk-green-dark">
                      {habitat.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="mono rounded-full bg-pk-green-light px-3 py-1 text-xs font-bold text-pk-green-dark">
                      {habitat.pokemonCount}
                    </span>
                    <CollectionToggleButton category="habitats" itemId={habitat.id} compact />
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground sm:text-xs">주 지역: {habitat.mapNames.join(' · ') || '미상'}</p>
                <p className="mt-1 text-sm text-muted-foreground sm:text-xs">주 서식지 포켓몬 {habitat.primaryPokemonCount}마리</p>
                <Link
                  href={`/habitats/${habitat.id}`}
                  className="mt-2 inline-flex rounded-full border border-border bg-white px-3 py-1 text-sm font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark sm:text-[11px]"
                >
                  자세히 보기
                </Link>
              </div>
            </div>
            <div className="border-t border-border bg-[#fffdf8] px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground sm:text-[11px]">연결 포켓몬</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {habitat.pokemonEntries.slice(0, 8).map((entry) => (
                  <Link
                    key={`${habitat.id}-${entry.slug}`}
                    href={`/pokemon/${entry.slug}`}
                    className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground hover:border-pk-green hover:text-pk-green-dark sm:text-[11px]"
                  >
                    #{entry.number} {entry.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
