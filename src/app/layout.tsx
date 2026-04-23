import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { HU } from '@/config/ui-text';
import { SiteFooter, SiteHeader, ShowcaseBanner } from '@/components/SiteShell';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'latin-ext'],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${HU.app_name} - ${HU.tagline}`,
    template: `%s - ${HU.app_name}`,
  },
  description: HU.hero_subtitle,
  openGraph: {
    title: `${HU.app_name} - ${HU.tagline}`,
    description: HU.hero_subtitle,
    locale: 'hu_HU',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <ShowcaseBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
