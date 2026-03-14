'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUpdatedSearchParams, type QueryParamValue } from '@/lib/url-state';

export function useSyncQueryParams(updates: Record<string, QueryParamValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // updates 객체 참조를 안정화: 실제 값이 바뀔 때만 ref를 갱신
  const updatesKey = JSON.stringify(updates);
  const updatesRef = useRef(updates);
  if (JSON.stringify(updatesRef.current) !== updatesKey) {
    updatesRef.current = updates;
  }

  useEffect(() => {
    const current = searchParams.toString();
    const next = buildUpdatedSearchParams(searchParams, updatesRef.current).toString();

    if (current === next) {
      return;
    }

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, updatesKey]);
}
