import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { areaThemes, habitatRarityTheme } from '@/lib/constants';
import { getPokemonBySlug, pokemon } from '@/lib/data';
import CollectionToggleButton from '@/components/collection-toggle-button';
import TypeBadge from '@/components/type-badge';
import type { Metadata } from 'next';

const allPokemon = pokemon;

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-5 py-3.5">
      <span className="w-20 flex-shrink-0 pt-0.5 text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="flex-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export function generateStaticParams() {
  return allPokemon.map((entry) => ({ id: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const entry = getPokemonBySlug(id);
  if (!entry) {
    return { title: '포켓몬을 찾을 수 없음 | 포코피아 가이드' };
  }

  return {
    title: `${entry.name} #${entry.number} | 포코피아 가이드`,
    description: `${entry.name}의 주 서식지, 좋아하는 환경, 특기, 가르쳐주는 기술을 정리했습니다.`,
  };
}

export default async function PokemonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = getPokemonBySlug(id);
  if (!entry) notFound();

  const theme = areaThemes[entry.primaryMap] ?? areaThemes[entry.primaryMapRecordLabel];
  const currentIndex = allPokemon.findIndex((pokemonEntry) => pokemonEntry.slug === entry.slug);
  const previousPokemon = currentIndex > 0 ? allPokemon[currentIndex - 1] : null;
  const nextPokemon = currentIndex >= 0 && currentIndex < allPokemon.length - 1 ? allPokemon[currentIndex + 1] : null;
  const relatedPokemon = allPokemon
    .filter((pokemonEntry) => pokemonEntry.primaryHabitat && pokemonEntry.primaryHabitat === entry.primaryHabitat && pokemonEntry.slug !== entry.slug)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <Link href="/pokemon" className="hover:text-pk-green">
          도감으로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          {previousPokemon && <Link href={`/pokemon/${previousPokemon.slug}`}>{previousPokemon.name}</Link>}
          {nextPokemon && <Link href={`/pokemon/${nextPokemon.slug}`}>{nextPokemon.name}</Link>}
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-border" style={{ backgroundColor: theme?.bg ?? '#fff' }}>
        <div className="grid gap-6 p-8 md:grid-cols-[220px_minmax(0,1fr)] md:p-10">
          <div className="flex items-center justify-center rounded-[1.75rem] bg-white/70 p-6">
            {entry.imagePath ? (
              <Image src={entry.imagePath} alt={entry.name} width={180} height={180} className="object-contain" priority />
            ) : (
              <div className="flex h-[180px] w-[180px] items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                이미지 없음
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-muted-foreground">#{entry.number}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-pk-brown-dark">{entry.primaryMap}</span>
              {entry.isEvent && <span className="rounded-full bg-pk-pink/15 px-3 py-1 text-xs font-bold text-pk-brown-dark">이벤트</span>}
              {entry.isEditorialVariant && (
                <span className="rounded-full bg-pk-gold/15 px-3 py-1 text-xs font-bold text-pk-brown-dark">편집 변형명</span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-extrabold text-pk-brown-dark md:text-4xl">{entry.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {entry.nameEn} · {entry.nameJp}
              </p>
            </div>

            <CollectionToggleButton category="pokemon" itemId={entry.slug} />

            <div className="flex flex-wrap gap-2">
              {entry.types.map((type) => (
                <TypeBadge key={type.nameJp} type={type.nameKo} size="md" />
              ))}
            </div>

            {entry.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.specialties.map((specialty) => (
                  <Link
                    key={specialty.nameJp}
                    href="/specialties"
                    className="rounded-full bg-pk-green-light px-3 py-1 text-xs font-bold text-pk-green-dark"
                  >
                    {specialty.nameKo}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card divide-y divide-border">
        <InfoRow label="공식 이름">
          <div className="space-y-1">
            <div className="font-semibold">{entry.officialName}</div>
            {entry.variantLabel && <div className="text-xs text-muted-foreground">표시명: {entry.name}</div>}
          </div>
        </InfoRow>
        <InfoRow label="주 지역">{entry.primaryMap}</InfoRow>
        <InfoRow label="주 서식지">
          {entry.primaryHabitatId ? (
            <Link href={`/habitats/${entry.primaryHabitatId}`} className="font-semibold text-pk-green-dark hover:text-pk-green">
              {entry.primaryHabitat}
            </Link>
          ) : (
            entry.primaryHabitat ?? '미상'
          )}
        </InfoRow>
        {entry.slotVariantNames.length > 0 && (
          <InfoRow label="같은 번호 폼">
            <div className="flex flex-wrap gap-1.5">
              {entry.slotVariantNames.map((name) => (
                <span key={name} className="rounded-full bg-pk-brown-light px-2.5 py-1 text-xs font-semibold text-pk-brown-dark">
                  {name}
                </span>
              ))}
            </div>
          </InfoRow>
        )}
        {entry.favoriteEnvironment && <InfoRow label="좋아하는 환경">{entry.favoriteEnvironment}</InfoRow>}
        {entry.taughtSkills.length > 0 && (
          <InfoRow label="가르쳐주는 기술">
            <div className="flex flex-wrap gap-1.5">
              {entry.taughtSkills.map((skill) => (
                <span key={skill.nameJp} className="rounded-full bg-pk-brown-light px-2.5 py-1 text-xs font-semibold text-pk-brown-dark">
                  {skill.nameKo}
                </span>
              ))}
            </div>
          </InfoRow>
        )}
      </section>

      {(entry.favoriteItems.length > 0 || entry.favoriteItemsNote || entry.favoriteItemVariants.length > 0 || entry.extraMaterials.length > 0) && (
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">좋아하는 것</h2>
          {entry.favoriteItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {entry.favoriteItems.map((item) => (
                <span key={item} className="rounded-full bg-pk-green-light px-3 py-1 text-xs font-semibold text-pk-green-dark">
                  {item}
                </span>
              ))}
            </div>
          )}
          {entry.favoriteItemsNote && <p className="mt-4 text-sm text-muted-foreground">{entry.favoriteItemsNote}</p>}
          {entry.favoriteItemVariants.length > 0 && (
            <div className="mt-4 space-y-3">
              {entry.favoriteItemVariants.map((variantItems, index) => (
                <div key={`${entry.slug}-fav-${index}`} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold text-muted-foreground">형태 {index + 1}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {variantItems.map((item) => (
                      <span key={`${entry.slug}-${index}-${item}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {entry.extraMaterials.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground">어지르기 추가 재료</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {entry.extraMaterials.map((item) => (
                  <span key={`${entry.slug}-extra-${item}`} className="rounded-full bg-pk-brown-light px-3 py-1 text-xs font-semibold text-pk-brown-dark">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">출현 서식지</h2>
          <p className="text-xs text-muted-foreground">희귀도, 시간대, 날씨는 원본 일본어 공략 자료를 기준으로 번역했습니다.</p>
        </div>
        {entry.habitats.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {entry.habitats.map((habitat) => {
              const rarityTheme = habitatRarityTheme[habitat.rarityLabel] ?? { color: '#8B6B4A', bg: '#F3EFE8' };
              return (
                <article key={`${entry.id}-${habitat.name}`} className="overflow-hidden rounded-3xl border border-border bg-card">
                  <div className="flex gap-4 p-5">
                    <div className="flex h-[92px] w-[92px] flex-shrink-0 items-center justify-center rounded-2xl bg-muted/40">
                      {habitat.imagePath ? (
                        <Image src={habitat.imagePath} alt={habitat.name} width={80} height={80} className="object-contain" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">이미지 없음</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-foreground">{habitat.name}</h3>
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: rarityTheme.bg, color: rarityTheme.color }}>
                          {habitat.rarityLabel} {habitat.rarityStars}
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        <p>
                          시간: <span className="font-medium text-foreground">{habitat.time.join(' · ')}</span>
                        </p>
                        <p>
                          날씨: <span className="font-medium text-foreground">{habitat.weather.join(' · ')}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  {habitat.requirementsKo.length > 0 && (
                    <div className="border-t border-border bg-pk-brown-light/35 px-5 py-4">
                      <p className="text-[11px] font-semibold text-pk-brown-dark">필요 재료</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {habitat.requirementsKo.map((requirement) => (
                          <span key={requirement} className="rounded-full bg-white px-2.5 py-1 text-[11px] text-foreground">
                            {requirement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            서식지 세부 데이터가 공개되지 않은 특수 개체입니다. 주 서식지 표기만 확인할 수 있습니다.
          </div>
        )}
      </section>

      {relatedPokemon.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">같은 주 서식지 포켓몬</h2>
          <div className="flex flex-wrap gap-2">
            {relatedPokemon.map((pokemonEntry) => (
              <Link
                key={pokemonEntry.slug}
                href={`/pokemon/${pokemonEntry.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark"
              >
                #{pokemonEntry.number} {pokemonEntry.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">원문 출처</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href={entry.sourceGame8Url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-4 py-2 hover:border-pk-green hover:text-pk-green-dark">
            Game8 원문
          </a>
          <a
            href={entry.sourcePokemonKoreaUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border px-4 py-2 hover:border-pk-green hover:text-pk-green-dark"
          >
            포켓몬코리아 도감
          </a>
        </div>
      </section>
    </div>
  );
}
