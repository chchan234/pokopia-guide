'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { buildUpdatedSearchParams, type QueryParamValue } from '@/lib/url-state';

export function useSyncQueryParams(updates: Record<string, QueryParamValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const current = searchParams.toString();
    const next = buildUpdatedSearchParams(searchParams, updates).toString();

    if (current === next) {
      return;
    }

    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, updates]);
}
