'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUpdatedSearchParams, type QueryParamValue } from '@/lib/url-state';

/**
 * URL 쿼리 파라미터를 상태와 동기화하는 훅.
 * 내부에서 updates 객체를 얕은 비교하므로, 호출부에서 useMemo로 감싸지 않아도 안전합니다.
 */
export function useSyncQueryParams(updates: Record<string, QueryParamValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevRef = useRef<Record<string, QueryParamValue>>(updates);

  // updates 객체의 얕은 비교로 실제 변경 시에만 참조를 갱신
  const keys = Object.keys(updates);
  const prevKeys = Object.keys(prevRef.current);
  const changed =
    keys.length !== prevKeys.length ||
    keys.some((key) => updates[key] !== prevRef.current[key]);

  if (changed) {
    prevRef.current = updates;
  }

  const stableUpdates = prevRef.current;

  useEffect(() => {
    const current = searchParams.toString();
    const next = buildUpdatedSearchParams(searchParams, stableUpdates).toString();

    if (current === next) {
      return;
    }

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, stableUpdates]);
}
