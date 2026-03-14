import type { ReadonlyURLSearchParams } from 'next/navigation';

export type QueryParamValue = string | string[] | null | undefined;

export function getQueryArray(searchParams: ReadonlyURLSearchParams, key: string) {
  return searchParams.getAll(key).filter(Boolean);
}

export function buildUpdatedSearchParams(
  searchParams: ReadonlyURLSearchParams,
  updates: Record<string, QueryParamValue>
) {
  const next = new URLSearchParams(searchParams.toString());

  for (const key of Object.keys(updates)) {
    next.delete(key);
  }

  for (const [key, value] of Object.entries(updates)) {
    if (Array.isArray(value)) {
      for (const item of value.map((entry) => entry.trim()).filter(Boolean)) {
        next.append(key, item);
      }
      continue;
    }

    const normalized = value?.trim();
    if (normalized) {
      next.set(key, normalized);
    }
  }

  return next;
}

export function withFromParam(href: string, from: string | null | undefined) {
  if (!from || !href.startsWith('/')) {
    return href;
  }

  const [pathWithQuery, hash = ''] = href.split('#');
  const [pathname, query = ''] = pathWithQuery.split('?');
  const params = new URLSearchParams(query);
  params.set('from', from);

  const nextQuery = params.toString();
  return `${pathname}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`;
}
