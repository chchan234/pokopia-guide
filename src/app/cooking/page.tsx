import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '요리 가이드 준비 중 | pokowiki',
};

export default function CookingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">요리 가이드</h1>
        <p className="mt-1 text-sm text-muted-foreground">원본 구조화 데이터가 정리되기 전까지 이 페이지는 공개하지 않습니다.</p>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 text-sm leading-7 text-foreground">
        현재 사이트는 원본 프로젝트에서 검증이 끝난 포켓몬, 서식지, 특기, 인간의 기록, 의상·헤어 데이터만 우선 공개합니다.
        요리 시스템은 데이터 근거가 정리되면 다시 추가할 예정입니다.
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/pokemon" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-pk-green hover:text-pk-green-dark">
          포켓몬 도감 보기
        </Link>
        <Link href="/records" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-pk-green hover:text-pk-green-dark">
          기록 가이드 보기
        </Link>
      </div>
    </div>
  );
}
