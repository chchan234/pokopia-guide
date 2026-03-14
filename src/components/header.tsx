'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navigationGroups } from '@/lib/navigation';

function matchesGroup(pathname: string, href: string, childHrefs: string[]) {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }

  return childHrefs.some((item) => pathname === item || pathname.startsWith(`${item}/`));
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // pathname 변경 시 모바일 메뉴 자동 닫기
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // 모바일 메뉴 열릴 때 body 스크롤 차단
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-pk-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Image src="/favicon.svg" alt="" aria-hidden width={22} height={22} className="h-[22px] w-[22px]" />
          <span className="text-[15px] font-extrabold tracking-tight text-pk-brown-dark">pokowiki</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
          {navigationGroups.map((group) => {
            const isActive = matchesGroup(
              pathname,
              group.href,
              group.children.map((item) => item.href)
            );
            return (
              <div key={group.key} className="group relative">
                <Link
                  href={group.href}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-pk-green text-white'
                      : 'text-pk-brown hover:bg-pk-green-light hover:text-pk-green-dark'
                  }`}
                >
                  {group.label}
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>

                <div className="invisible absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border bg-card p-2 opacity-0 shadow-[0_18px_48px_-20px_rgba(61,50,38,0.4)] transition-all group-hover:visible group-hover:opacity-100">
                  <div className="space-y-1">
                    {group.children.map((item) => {
                      const isChildActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block rounded-xl px-3 py-2 transition-colors ${
                            isChildActive ? 'bg-pk-green-light text-pk-green-dark' : 'hover:bg-muted'
                          }`}
                        >
                          <div className="text-sm font-semibold text-foreground">{item.label}</div>
                          {item.description && <div className="mt-0.5 text-[11px] text-muted-foreground">{item.description}</div>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-controls="mobile-nav"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-pk-brown-dark md:hidden"
        >
          <span className="sr-only">{mobileOpen ? '메뉴 닫기' : '메뉴 열기'}</span>
          {mobileOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" className="border-t border-border bg-pk-cream px-5 py-3 md:hidden">
          <div className="mx-auto max-w-6xl space-y-3">
            {navigationGroups.map((group) => {
              const isActive = matchesGroup(
                pathname,
                group.href,
                group.children.map((item) => item.href)
              );

              return (
                <section key={`mobile-${group.key}`} className="rounded-2xl border border-border bg-card p-3">
                  <Link
                    href={group.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                      isActive ? 'bg-pk-green text-white' : 'text-pk-brown-dark hover:bg-pk-green-light'
                    }`}
                  >
                    {group.label}
                  </Link>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {group.children.map((item) => {
                      const isChildActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={`mobile-child-${item.href}`}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`rounded-xl px-3 py-2 text-center text-[13px] font-semibold transition-colors ${
                            isChildActive
                              ? 'bg-pk-green-light text-pk-green-dark'
                              : 'bg-background text-pk-brown hover:bg-pk-green-light hover:text-pk-green-dark'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
