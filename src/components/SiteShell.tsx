import Link from 'next/link';
import type { Locale, Messages } from '@/lib/i18n';
import { LocaleSwitcher } from './LocaleSwitcher';

export function SiteHeader({
  locale,
  messages,
}: {
  locale: Locale;
  messages: Messages;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-900"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white"
            aria-hidden
          >
            IC
          </span>
          {messages.app_name}
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/upload" className="hover:text-slate-900">
              {messages.nav_upload}
            </Link>
            <Link href="/stats" className="hover:text-slate-900">
              {messages.nav_stats}
            </Link>
            <Link href="/adatvedelem" className="hover:text-slate-900">
              {messages.nav_privacy}
            </Link>
          </nav>
          <LocaleSwitcher locale={locale} messages={messages} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ messages }: { messages: Messages }) {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{messages.footer_about}</p>
        <div className="flex items-center gap-4">
          <Link href="/adatvedelem" className="hover:text-slate-900">
            {messages.privacy_title}
          </Link>
          <span aria-hidden>-</span>
          <span>
            {messages.copyright_label} {new Date().getFullYear()} {messages.app_name}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function ShowcaseBanner({ messages }: { messages: Messages }) {
  return (
    <div className="bg-slate-900 text-center text-[11px] font-medium uppercase tracking-wide text-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-2">{messages.showcase_banner}</div>
    </div>
  );
}
