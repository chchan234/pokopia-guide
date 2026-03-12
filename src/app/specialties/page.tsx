import Link from 'next/link';
import { pokemon, specialties } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '특기 가이드 | pokowiki',
  description: `포코피아 포켓몬 특기 ${specialties.length}개를 보유 포켓몬 기준으로 묶어 정리한 페이지입니다.`,
};

export default function SpecialtiesPage() {
  const specialtyGroups = specialties.map((specialty) => ({
    ...specialty,
    pokemon: pokemon.filter((entry) => entry.specialties.some((item) => item.nameKo === specialty.name)),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">특기 가이드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          총 {specialties.length}개 특기 · 인게임 표기와 원문 자료를 함께 반영한 묶음
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {specialtyGroups.map((specialty) => (
          <a
            key={specialty.id}
            href={`#${specialty.id}`}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-pk-green hover:bg-pk-green-light"
          >
            {specialty.name}
            <span className="mono ml-1 text-muted-foreground">{specialty.pokemonCount}</span>
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {specialtyGroups.map((specialty) => (
          <section key={specialty.id} id={specialty.id} className="scroll-mt-20 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="border-b border-border bg-pk-green-light/30 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">{specialty.name}</h2>
                  <p className="text-xs text-muted-foreground">{specialty.nameJp}</p>
                </div>
                <span className="mono text-lg font-bold text-pk-green">{specialty.pokemonCount}</span>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                {specialty.pokemon.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/pokemon/${entry.slug}`}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark"
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
