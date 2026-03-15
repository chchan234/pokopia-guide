import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="mono text-6xl font-bold text-pk-green">404</p>
      <h1 className="mt-4 text-xl font-extrabold text-foreground">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-sm text-muted-foreground">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <Link
        prefetch={false} href="/"
        className="mt-8 rounded-full bg-pk-green px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pk-green-dark"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
