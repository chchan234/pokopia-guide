import Link from 'next/link';
import HomeSearchClient from '@/components/home-search-client';
import { globalSearchEntries } from '@/lib/data';
import { navigationGroups } from '@/lib/navigation';

export default function HomePage() {
  const quickLinks = navigationGroups.flatMap((group) =>
    group.children.map((item) => ({
      ...item,
      groupLabel: group.label,
    })),
  );

  return (
    <div className="space-y-8">
      <HomeSearchClient entries={globalSearchEntries} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">바로 찾기</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-border bg-card p-5 transition-colors hover:border-pk-green hover:bg-pk-green-light/30"
            >
              <div className="text-[11px] font-semibold text-muted-foreground">{item.groupLabel}</div>
              <div className="mt-2 text-lg font-bold text-foreground">{item.label}</div>
              {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
