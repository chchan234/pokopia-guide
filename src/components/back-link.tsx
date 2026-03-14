'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { withFromParam } from '@/lib/url-state';

function useFromParam() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  return from && from.startsWith('/') && !from.startsWith('//') ? from : null;
}

function BackLinkInner({ fallback, label }: { fallback: string; label: string }) {
  const from = useFromParam();

  return (
    <Link href={from ?? fallback} className="hover:text-pk-green">
      {label}
    </Link>
  );
}

export default function BackLink({ fallback, label }: { fallback: string; label: string }) {
  return (
    <Suspense fallback={<Link href={fallback} className="hover:text-pk-green">{label}</Link>}>
      <BackLinkInner fallback={fallback} label={label} />
    </Suspense>
  );
}

function FromLinkInner({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const from = useFromParam();

  return (
    <Link href={withFromParam(href, from)} className={className}>
      {children}
    </Link>
  );
}

export function FromLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Suspense fallback={<Link href={href} className={className}>{children}</Link>}>
      <FromLinkInner href={href} className={className}>{children}</FromLinkInner>
    </Suspense>
  );
}
