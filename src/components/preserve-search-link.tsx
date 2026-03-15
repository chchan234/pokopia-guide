'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { withFromParam } from '@/lib/url-state';

type PreserveSearchLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export default function PreserveSearchLink({ href, ...props }: PreserveSearchLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocation = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  return <Link prefetch={false} href={withFromParam(href, currentLocation)} {...props} />;
}
