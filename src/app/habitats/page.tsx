import Image from 'next/image';
import Link from 'next/link';
import CollectionToggleButton from '@/components/collection-toggle-button';
import { habitats } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서식지 가이드 | 포코피아 가이드',
  description: '포코피아 서식지 212개를 이미지와 연결 포켓몬 기준으로 정리한 페이지입니다.',
};

export default function HabitatsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">서식지 가이드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          총 {habitats.length}개 서식지 · 이미지와 포켓몬 매칭을 원본 데이터 기준으로 정리
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {habitats.map((habitat) => (
          <section key={habitat.id} id={habitat.id} className="scroll-mt-20 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="flex gap-4 p-5">
              <div className="flex h-[96px] w-[96px] flex-shrink-0 items-center justify-center rounded-2xl bg-pk-green-light/40">
                {habitat.imagePath ? (
                  <Image src={habitat.imagePath} alt={habitat.name} width={84} height={84} className="object-contain" />
                ) : (
                  <span className="text-[11px] text-muted-foreground">이미지 없음</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
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
                <p className="mt-2 text-xs text-muted-foreground">주 지역: {habitat.mapNames.join(' · ') || '미상'}</p>
                <p className="mt-1 text-xs text-muted-foreground">주 서식지 포켓몬 {habitat.primaryPokemonCount}마리</p>
              </div>
            </div>
            <div className="border-t border-border bg-[#fffdf8] px-5 py-4">
              <p className="text-[11px] font-semibold text-muted-foreground">연결 포켓몬</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {habitat.pokemonEntries.slice(0, 8).map((entry) => (
                  <Link
                    key={`${habitat.id}-${entry.slug}`}
                    href={`/pokemon/${entry.slug}`}
                    className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-foreground hover:border-pk-green hover:text-pk-green-dark"
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
