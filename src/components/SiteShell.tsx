import Link from 'next/link';
import { HU } from '@/config/ui-text';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
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
          {HU.app_name}
        </Link>
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link href="/upload" className="hover:text-slate-900">
            {HU.nav_upload}
          </Link>
          <Link href="/stats" className="hover:text-slate-900">
            {HU.nav_stats}
          </Link>
          <Link href="/adatvedelem" className="hover:text-slate-900">
            {HU.nav_privacy}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{HU.footer_about}</p>
        <div className="flex items-center gap-4">
          <Link href="/adatvedelem" className="hover:text-slate-900">
            {HU.privacy_title}
          </Link>
          <span aria-hidden>·</span>
          <span>
            © {new Date().getFullYear()} {HU.app_name}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function ShowcaseBanner() {
  return (
    <div className="bg-slate-900 text-center text-[11px] font-medium uppercase tracking-wide text-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-2">{HU.showcase_banner}</div>
    </div>
  );
}
