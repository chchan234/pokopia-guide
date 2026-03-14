import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHabitatById, getItemImage, habitats, pokemon } from '@/lib/data';
import { areaThemes } from '@/lib/constants';
import CollectionToggleButton from '@/components/collection-toggle-button';
import TypeBadge from '@/components/type-badge';
import ZoomableImage from '@/components/zoomable-image';
import MaterialTag from '@/components/material-tag';
import HabitatPokemonCard from '@/components/habitat-pokemon-card';
import type { Metadata } from 'next';
import { withFromParam } from '@/lib/url-state';

export function generateStaticParams() {
  return habitats.map((habitat) => ({ id: habitat.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const habitat = getHabitatById(id);
  if (!habitat) {
    return { title: '서식지를 찾을 수 없음 | pokowiki' };
  }

  return {
    title: `${habitat.number ? `No.${habitat.number} ` : habitat.isEvent ? '이벤트 서식지 ' : ''}${habitat.name} | pokowiki`,
    description: `${habitat.number ? `No.${habitat.number} ` : habitat.isEvent ? '이벤트 서식지 ' : ''}${habitat.name}에 연결된 포켓몬과 지역 분포를 정리했습니다.`,
  };
}

export default async function HabitatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const habitat = getHabitatById(id);
  if (!habitat) notFound();

  const previousLocation = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : null;

  const linkedPokemon = habitat.pokemonEntries
    .map((item) => pokemon.find((entry) => entry.slug === item.slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const primaryPokemon = linkedPokemon.filter((entry) => entry.primaryHabitatId === habitat.id);
  const secondaryPokemon = linkedPokemon.filter((entry) => entry.primaryHabitatId !== habitat.id);
  const theme = areaThemes[habitat.mapNames[0]];

  // 현재 서식지 페이지 경로를 포켓몬 링크에 from으로 전달
  const currentPath = `/habitats/${id}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <Link href={previousLocation ?? '/habitats'} className="hover:text-pk-green">
          서식지 목록으로 돌아가기
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-border" style={{ backgroundColor: theme?.bg ?? 'var(--card)' }}>
        <div className="grid gap-6 p-8 md:grid-cols-[220px_minmax(0,1fr)] md:p-10">
          <div className="flex items-center justify-center rounded-[1.75rem] bg-card/70 p-6">
            {habitat.imagePath ? (
              <ZoomableImage
                src={habitat.imagePath}
                alt={habitat.name}
                width={180}
                height={180}
                className="object-contain"
                buttonClassName="inline-flex cursor-zoom-in items-center justify-center"
                priority
              />
            ) : (
              <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                이미지 없음
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {habitat.number && (
                <span className="mono rounded-full bg-card/80 px-3 py-1 text-xs font-bold text-muted-foreground">
                  No.{habitat.number}
                </span>
              )}
              {!habitat.number && habitat.isEvent && (
                <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-bold text-muted-foreground">이벤트 서식지</span>
              )}
              <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-pk-brown-dark">
                포켓몬 {habitat.pokemonCount}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-pk-brown-dark md:text-4xl">{habitat.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">주 지역: {habitat.mapNames.join(' · ') || '미상'}</p>
            </div>
            <CollectionToggleButton category="habitats" itemId={habitat.id} />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-card/75 px-4 py-3">
                <div className="mono text-lg font-bold text-foreground">{habitat.pokemonCount}</div>
                <div className="mt-1 text-xs text-muted-foreground">연결 포켓몬</div>
              </div>
              <div className="rounded-2xl bg-card/75 px-4 py-3">
                <div className="mono text-lg font-bold text-foreground">{habitat.primaryPokemonCount}</div>
                <div className="mt-1 text-xs text-muted-foreground">주 서식지 포켓몬</div>
              </div>
              <div className="rounded-2xl bg-card/75 px-4 py-3">
                <div className="mono text-lg font-bold text-foreground">{habitat.mapNames.length}</div>
                <div className="mt-1 text-xs text-muted-foreground">연결 지역</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {habitat.requirementsKo.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">서식지 재료</h2>
            <p className="mt-1 text-xs text-muted-foreground">현재 확보된 한국어 재료명을 우선 표기합니다.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {habitat.requirementsKo.map((requirement) => (
              <MaterialTag key={`${habitat.id}-${requirement}`} material={requirement} imageSrc={getItemImage(requirement)} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">주 서식지 포켓몬</h2>
          <p className="text-xs text-muted-foreground">이 서식지가 포켓몬의 대표 서식지로 표기된 엔트리입니다.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {primaryPokemon.map((entry) => (
            <HabitatPokemonCard key={entry.slug} slug={entry.slug}>
              <Link href={withFromParam(`/pokemon/${entry.slug}`, currentPath)} className="block rounded-3xl border border-border bg-card p-4 hover:border-pk-green">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mono text-[11px] text-muted-foreground">#{entry.number}</p>
                    <h3 className="mt-1 text-sm font-bold text-foreground">{entry.name}</h3>
                  </div>
                  {entry.imagePath ? <Image src={entry.imagePath} alt={entry.name} width={56} height={56} className="object-contain" /> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.types.map((type) => (
                    <TypeBadge key={`${entry.slug}-${type.nameJp}`} type={type.nameKo} />
                  ))}
                </div>
              </Link>
            </HabitatPokemonCard>
          ))}
        </div>
      </section>

      {secondaryPokemon.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">보조 출현 포켓몬</h2>
            <p className="text-xs text-muted-foreground">대표 서식지는 아니지만 이 서식지에도 연결된 포켓몬입니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {secondaryPokemon.map((entry) => (
              <HabitatPokemonCard key={entry.slug} slug={entry.slug}>
                <Link
                  href={withFromParam(`/pokemon/${entry.slug}`, currentPath)}
                  className="block rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark"
                >
                  #{entry.number} {entry.name}
                </Link>
              </HabitatPokemonCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
