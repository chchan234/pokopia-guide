import SpecialtiesFilter from '@/components/specialties-filter';
import { pokemon, specialties } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '특기 | pokowiki',
  description: `포코피아 포켓몬 특기 ${specialties.length}개를 보유 포켓몬 기준으로 묶어 정리한 페이지입니다.`,
};

export default function SpecialtiesPage() {
  const specialtyGroups = specialties.map((specialty) => ({
    id: specialty.id,
    name: specialty.name,
    nameJp: specialty.nameJp,
    pokemon: pokemon
      .filter((entry) => entry.specialties.some((item) => item.nameKo === specialty.name))
      .map((entry) => ({
        slug: entry.slug,
        number: entry.number,
        name: entry.name,
        officialName: entry.officialName,
        nameEn: entry.nameEn,
        nameJp: entry.nameJp,
      })),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">특기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          총 {specialties.length}개 특기 · 인게임 표기와 원문 자료를 함께 반영한 묶음
        </p>
      </div>
      <SpecialtiesFilter groups={specialtyGroups} />
    </div>
  );
}
