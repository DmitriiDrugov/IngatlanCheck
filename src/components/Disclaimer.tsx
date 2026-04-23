import type { Messages } from '@/lib/i18n';

export function Disclaimer({
  messages,
  variant = 'default',
}: {
  messages: Messages;
  variant?: 'default' | 'compact';
}) {
  if (variant === 'compact') {
    return <p className="text-xs leading-relaxed text-slate-500">{messages.disclaimer}</p>;
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
      <span className="font-semibold">{messages.disclaimer_prefix} </span>
      {messages.disclaimer}
    </div>
  );
}
