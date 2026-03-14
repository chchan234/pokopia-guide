'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="mono text-6xl font-bold text-destructive">!</p>
      <h1 className="mt-4 text-xl font-extrabold text-foreground">문제가 발생했습니다</h1>
      <p className="mt-2 text-sm text-muted-foreground">페이지를 불러오는 중 오류가 발생했습니다.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-pk-green px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pk-green-dark"
      >
        다시 시도
      </button>
    </div>
  );
}
