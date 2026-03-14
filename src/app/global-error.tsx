'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#fff9f0', color: '#3d3226' }}>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', fontWeight: 700, color: '#d95e4b' }}>!</p>
          <h1 style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: 800 }}>심각한 오류가 발생했습니다</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#9b8b78' }}>페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2rem',
              borderRadius: '9999px',
              backgroundColor: '#6ebd44',
              padding: '0.625rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
