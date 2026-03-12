import { allMapNames, allSpecialties, allTypes, pokemon } from '@/lib/data';
import PokemonFilter from '@/components/pokemon-filter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '포켓몬 도감 | 포코피아 가이드',
  description: '포코피아 포켓몬 306종을 공식 한국어명과 서식지 데이터 기준으로 정리한 도감입니다.',
};

export default function PokemonListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">포켓몬 도감</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          총 {pokemon.length}마리 · 공식 한국어명 · 서식지와 특기 기준 필터 지원
        </p>
      </div>

      <PokemonFilter pokemon={pokemon} types={allTypes} specialties={allSpecialties} mapNames={allMapNames} />
    </div>
  );
}
