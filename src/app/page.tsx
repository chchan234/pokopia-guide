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

        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-pk-green hover:bg-pk-green-light/30"
            >
              <span className="text-[11px] font-medium text-muted-foreground">{item.groupLabel}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
