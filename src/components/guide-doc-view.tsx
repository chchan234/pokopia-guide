import Link from 'next/link';
import type { GuideDoc } from '@/lib/guides';

export default function GuideDocView({ doc }: { doc: GuideDoc }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <Link href="/guides" className="hover:text-pk-green">
          공략 허브로 돌아가기
        </Link>
      </div>

      <section className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-pk-green-light px-3 py-1 text-xs font-semibold text-pk-green-dark">{doc.statusLabel}</span>
          <span className="rounded-full bg-pk-brown-light px-3 py-1 text-xs font-semibold text-pk-brown-dark">
            주요 출처 {doc.sources.length}개
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold text-foreground md:text-4xl">{doc.title}</h1>
        <p className="mt-3 text-base text-muted-foreground">{doc.shortDescription}</p>
        <p className="mt-5 rounded-3xl bg-background px-5 py-4 text-sm leading-6 text-foreground">{doc.heroSummary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {doc.keyPoints.map((item) => (
            <span key={`${doc.slug}-${item}`} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {doc.sections.map((section) => (
          <article key={`${doc.slug}-${section.title}`} className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            {section.summary ? <p className="mt-2 text-sm text-muted-foreground">{section.summary}</p> : null}
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              {section.bullets.map((bullet) => (
                <li key={`${doc.slug}-${section.title}-${bullet}`} className="rounded-2xl bg-background px-4 py-3 leading-6">
                  {bullet}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">참고 출처</h2>
          <div className="mt-4 space-y-3">
            {doc.sources.map((source) => (
              <a
                key={`${doc.slug}-${source.href}`}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-border bg-background px-4 py-4 transition-colors hover:border-pk-green"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-pk-green-light px-2.5 py-1 text-[11px] font-semibold text-pk-green-dark">{source.site}</span>
                  <span className="text-sm font-bold text-foreground">{source.title}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{source.note}</p>
              </a>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">기존 페이지 연결</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {doc.relatedRoutes.map((route) => (
              <Link
                key={`${doc.slug}-${route.href}`}
                href={route.href}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:border-pk-green hover:text-pk-green-dark"
              >
                {route.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            이 공략 페이지는 기존 도감/아이템/수집 탭과 연결해서, “정보 보기”에서 끝나지 않고 “실제로 진행하는 흐름”까지 이어지도록 설계했습니다.
          </p>
        </article>
      </section>
    </div>
  );
}
