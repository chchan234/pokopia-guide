import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CollectionToggleButton from '@/components/collection-toggle-button';
import { getRecordById, humanRecords } from '@/lib/data';
import { areaThemes } from '@/lib/constants';
import type { Metadata } from 'next';
import { withFromParam } from '@/lib/url-state';

export function generateStaticParams() {
  return humanRecords.map((record) => ({ id: String(record.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const record = getRecordById(Number(id));
  if (!record) {
    return { title: '기록을 찾을 수 없음 | pokowiki' };
  }

  return {
    title: `${record.name} | pokowiki`,
    description: `${record.name}의 위치와 보상 정보를 정리했습니다.`,
  };
}

export default async function RecordDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const record = getRecordById(Number(id));
  if (!record) notFound();

  const previousLocation = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : null;

  const currentIndex = humanRecords.findIndex((entry) => entry.id === record.id);
  const previousRecord = currentIndex > 0 ? humanRecords[currentIndex - 1] : null;
  const nextRecord = currentIndex >= 0 && currentIndex < humanRecords.length - 1 ? humanRecords[currentIndex + 1] : null;
  const theme = areaThemes[record.map];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <Link href={previousLocation ?? '/records'} className="hover:text-pk-green">
          기록 목록으로 돌아가기
        </Link>
        <div className="flex items-center gap-3">
          {previousRecord && <Link href={withFromParam(`/records/${previousRecord.id}`, previousLocation)}>{previousRecord.name}</Link>}
          {nextRecord && <Link href={withFromParam(`/records/${nextRecord.id}`, previousLocation)}>{nextRecord.name}</Link>}
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-border" style={{ backgroundColor: theme?.bg ?? 'var(--card)' }}>
        <div className="space-y-5 p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono rounded-full bg-card/80 px-3 py-1 text-xs font-bold text-muted-foreground">#{String(record.id).padStart(3, '0')}</span>
            <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-pk-brown-dark">{record.type} {record.orderInType}</span>
            <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-semibold text-pk-brown-dark">{record.map}</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-pk-brown-dark md:text-4xl">{record.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{record.locationDetail}</p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <CollectionToggleButton category="records" itemId={record.id} />
            {record.directReward && (
              <div className="max-w-full rounded-2xl bg-card/80 px-4 py-3 text-sm text-foreground">
                <p className="text-[11px] font-semibold text-pk-green-dark">{record.directRewardType}</p>
                <p className="mt-1 break-words font-bold">{record.directReward}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">입수 정보</h2>
        <div className="mt-4 space-y-3 text-sm text-foreground">
          <p>
            <span className="font-semibold text-pk-brown-dark">맵:</span> {record.map}
          </p>
          <p>
            <span className="font-semibold text-pk-brown-dark">상세 위치:</span> {record.locationDetail}
          </p>
          <p>
            <span className="font-semibold text-pk-brown-dark">패션 연계:</span> {record.hasFashionReward ? `있음 (${record.fashionRewardCount}개)` : '없음'}
          </p>
        </div>
      </section>

      {record.fashionRewards.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">연결된 의상·헤어 보상</h2>
            <p className="text-xs text-muted-foreground">이미지가 있는 보상은 바로 확인할 수 있게 붙였습니다.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {record.fashionRewards.map((reward) => (
              <article key={`${record.id}-${reward.category}-${reward.name}`} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex h-[120px] items-center justify-center rounded-2xl bg-muted/30">
                  {reward.imagePath ? (
                    <Image src={reward.imagePath} alt={reward.name} width={96} height={96} className="object-contain" />
                  ) : (
                    <span className="text-xs text-muted-foreground">이미지 없음</span>
                  )}
                </div>
                <p className="mt-3 text-[11px] font-semibold text-pk-green-dark">{reward.category}</p>
                <h3 className="mt-1 break-words text-sm font-bold text-foreground">{reward.name}</h3>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">원문 출처</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href={record.sourceGame8Url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-4 py-2 hover:border-pk-green hover:text-pk-green-dark">
            Game8 원문
          </a>
        </div>
      </section>
    </div>
  );
}
