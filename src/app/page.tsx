import Link from 'next/link';
import { fashionCategories, maps, stats } from '@/lib/data';
import { areaThemes } from '@/lib/constants';

const quickLinks = [
  { href: '/pokemon', title: '포켓몬 도감' },
  { href: '/habitats', title: '서식지' },
  { href: '/specialties', title: '특기' },
  { href: '/records', title: '인간의 기록' },
  { href: '/fashion', title: '의상·헤어' },
  { href: '/collection', title: '내 수집' },
  { href: '/house-planner', title: '집 추천' },
];

export default function HomePage() {
  const fashionCount = fashionCategories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className="space-y-12">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {[
          { label: '포켓몬', value: stats.pokemonCount, color: '#6EBD44' },
          { label: '서식지', value: stats.habitatCount, color: '#4C87BD' },
          { label: '특기', value: stats.specialtyCount, color: '#C66E4A' },
          { label: '기록', value: stats.recordCount, color: '#8C63C7' },
          { label: '의상·헤어', value: fashionCount, color: '#D27299' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="mono text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">지역 분포</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {maps.map((map) => {
            const theme = areaThemes[map.name] ?? areaThemes[map.recordName];
            return (
              <div key={map.key} className="rounded-3xl border border-border p-5" style={{ backgroundColor: theme?.bg ?? '#fff' }}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{map.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{map.recordName}</p>
                  </div>
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme?.color ?? '#8B6B4A' }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-2xl bg-white/75 px-2 py-3">
                    <div className="mono text-base font-bold text-foreground">{map.pokemonCount}</div>
                    <div className="mt-1 text-muted-foreground">포켓몬</div>
                  </div>
                  <div className="rounded-2xl bg-white/75 px-2 py-3">
                    <div className="mono text-base font-bold text-foreground">{map.habitatCount}</div>
                    <div className="mt-1 text-muted-foreground">서식지</div>
                  </div>
                  <div className="rounded-2xl bg-white/75 px-2 py-3">
                    <div className="mono text-base font-bold text-foreground">{map.recordCount}</div>
                    <div className="mt-1 text-muted-foreground">기록</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="pk-card flex min-h-16 items-center justify-center rounded-3xl border border-border bg-card px-5 py-4 text-center"
          >
            <h2 className="text-base font-bold text-foreground">{item.title}</h2>
          </Link>
        ))}
      </section>
    </div>
  );
}
