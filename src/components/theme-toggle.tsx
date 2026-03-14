'use client';

import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  if (!resolvedTheme) {
    return (
      <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground" aria-label="테마 전환">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M12 2V4M12 20V22M4 12H2M22 12H20M5.64 5.64L4.22 4.22M19.78 19.78L18.36 18.36M5.64 18.36L4.22 19.78M19.78 4.22L18.36 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
