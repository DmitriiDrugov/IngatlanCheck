import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getLocale, getMessages } from '@/lib/i18n';
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return {
    metadataBase: new URL(appUrl),
    title: {
      default: `${messages.app_name} - ${messages.tagline}`,
      template: `%s - ${messages.app_name}`,
    },
    description: messages.hero_subtitle,
    openGraph: {
      title: `${messages.app_name} - ${messages.tagline}`,
      description: messages.hero_subtitle,
      locale,
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <ShowcaseBanner messages={messages} />
        <SiteHeader locale={locale} messages={messages} />
        <main className="flex-1">{children}</main>
        <SiteFooter messages={messages} />
      </body>
    </html>
  );
}
