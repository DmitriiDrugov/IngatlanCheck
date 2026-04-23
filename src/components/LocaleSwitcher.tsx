'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale, Messages } from '@/lib/i18n';

export function LocaleSwitcher({
  locale,
  messages,
}: {
  locale: Locale;
  messages: Messages;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span>{messages.language_label}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => {
          const nextLocale = e.target.value;
          document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
          startTransition(() => {
            router.replace(pathname);
            router.refresh();
          });
        }}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
      >
        <option value="hu">{messages.language_hu}</option>
        <option value="ru">{messages.language_ru}</option>
        <option value="en">{messages.language_en}</option>
      </select>
    </label>
  );
}
