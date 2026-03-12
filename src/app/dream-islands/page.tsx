import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '꿈섬 가이드 준비 중 | 포코피아 가이드',
};

export default function DreamIslandsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">꿈섬 가이드</h1>
        <p className="mt-1 text-sm text-muted-foreground">원본 구조화 데이터가 불완전해서 임시 보류 중입니다.</p>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 text-sm leading-7 text-foreground">
        현재 사이트에서는 꿈섬 관련 기록 위치와 의상 해금 정보만 원본 기준으로 제공하고 있습니다. 별도 꿈섬 데이터셋이 정리되면 전용 페이지를 다시 연결합니다.
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/records" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-pk-green hover:text-pk-green-dark">
          기록 가이드 보기
        </Link>
        <Link href="/fashion" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-pk-green hover:text-pk-green-dark">
          의상 가이드 보기
        </Link>
      </div>
    </div>
  );
}
