import type { Metadata } from 'next';
import Script from 'next/script';
import { CollectionProvider } from '@/components/collection-provider';
import Header from '@/components/header';
import './globals.css';

export const metadata: Metadata = {
  title: 'pokowiki',
  description:
    '포켓몬 포코피아 포켓몬 도감, 서식지, 인간의 기록, 의상·헤어 입수처를 원본 데이터 기준으로 정리한 한국어 위키.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-5GE2PLN0JN" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5GE2PLN0JN');`}
        </Script>
        <CollectionProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fffdf8_0%,#fff9f0_48%,#f9f0e1_100%)]">
            <Header />
            <main className="max-w-6xl mx-auto px-5 py-6 md:px-6">{children}</main>
            <footer className="border-t border-border mt-16 py-8 text-center text-xs text-muted-foreground">
              <p>pokowiki · 팬 제작 비공식 데이터 정리</p>
              <p className="mt-1">문의사항: coldcow11@gmail.com</p>
              <p className="mt-1 opacity-70">
                This is an unofficial fan site. Pokemon and Pokopia are trademarks of Nintendo / The Pokemon Company. This site is not affiliated with or endorsed by Nintendo / The Pokemon Company.
              </p>
            </footer>
          </div>
        </CollectionProvider>
      </body>
    </html>
  );
}
