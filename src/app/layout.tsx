import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { CollectionProvider } from '@/components/collection-provider';
import Header from '@/components/header';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'pokowiki',
  description:
    '포켓몬 포코피아 도감, 서식지, 인간의 기록, 의상·헤어, 꿈섬, 요리, 아이템을 정리한 한국어 위키.',
  openGraph: {
    title: 'pokowiki - 포코피아 한국어 위키',
    description: '포켓몬 포코피아 도감, 서식지, 아이템, 요리, 집 추천을 한눈에.',
    url: 'https://pokowiki.coldcow.dev',
    siteName: 'pokowiki',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pokowiki - 포코피아 한국어 위키',
    description: '포켓몬 포코피아 도감, 서식지, 아이템, 요리, 집 추천을 한눈에.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4481144756114483" />
      </head>
      <body className="font-sans antialiased">
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4481144756114483"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-5GE2PLN0JN" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5GE2PLN0JN');`}
        </Script>
        <CollectionProvider>
            <div className="min-h-screen" style={{ background: 'var(--pk-gradient)' }}>
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
