'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/pokemon', label: '도감' },
  { href: '/habitats', label: '서식지' },
  { href: '/specialties', label: '특기' },
  { href: '/records', label: '기록' },
  { href: '/fashion', label: '의상' },
  { href: '/collection', label: '내 수집' },
  { href: '/house-planner', label: '집 추천' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-pk-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <Image src="/favicon.svg" alt="" aria-hidden width={22} height={22} className="h-[22px] w-[22px]" />
          <span className="text-[15px] font-extrabold tracking-tight text-pk-brown-dark">pokowiki</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'bg-pk-green text-white'
                    : 'text-pk-brown hover:bg-pk-green-light hover:text-pk-green-dark'
                }`}
              >
                {item.label}
              </Link>
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
          <div className="mx-auto max-w-6xl grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-3 py-2 text-center text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-pk-green text-white'
                      : 'bg-card text-pk-brown hover:bg-pk-green-light hover:text-pk-green-dark'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
