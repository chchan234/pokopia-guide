'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSyncQueryParams } from '@/hooks/use-sync-query-params';
import type { GuideDoc } from '@/lib/guides';

interface GuidesPageClientProps {
  docs: GuideDoc[];
}

export default function GuidesPageClient({ docs }: GuidesPageClientProps) {
  const searchParams = useSearchParams();
  const querySearch = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(querySearch);

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const syncedParams = useMemo(() => ({ q: search }), [search]);

  useSyncQueryParams(syncedParams);

  const filteredDocs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return docs;
    }

    return docs.filter((doc) =>
      [doc.title, doc.shortDescription, doc.heroSummary, ...doc.keyPoints, ...doc.searchTerms, ...doc.sections.flatMap((section) => [section.title, ...(section.summary ? [section.summary] : []), ...section.bullets])]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [docs, search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">공략</h1>
        <p className="mt-1 text-sm text-muted-foreground">Game8, GameWith를 대조해 지금 사이트에 추가할 공략형 페이지를 먼저 설계했습니다.</p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="스토리, 초보자, 건축, 이벤트로 검색"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-pk-green focus:outline-none focus:ring-2 focus:ring-pk-green/20 lg:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            <span className="mono font-semibold text-foreground">{filteredDocs.length}</span>
            {search.trim() ? ` / ${docs.length}` : ''}개
          </p>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredDocs.map((doc) => (
          <article key={doc.slug} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">{doc.statusLabel}</span>
              <span className="rounded-full bg-pk-brown-light px-2.5 py-1 text-[11px] font-semibold text-pk-brown-dark">
                출처 {doc.sources.length}
              </span>
            </div>

            <h2 className="mt-4 text-xl font-bold text-foreground">{doc.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{doc.shortDescription}</p>
            <p className="mt-3 rounded-2xl bg-background px-4 py-3 text-sm text-foreground">{doc.heroSummary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {doc.keyPoints.map((item) => (
                <span key={`${doc.slug}-${item}`} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {doc.sources.slice(0, 3).map((source) => (
                <a
                  key={`${doc.slug}-${source.href}`}
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark"
                >
                  {source.site} · {source.title}
                </a>
              ))}
            </div>

            <Link
              href={`/guides/${doc.slug}`}
              className="mt-5 inline-flex rounded-full bg-pk-green px-4 py-2 text-sm font-semibold text-white hover:bg-pk-green-dark"
            >
              자세히 보기
            </Link>
          </article>
        ))}
      </div>

      {filteredDocs.length === 0 && <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</div>}
    </div>
  );
}
