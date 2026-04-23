import { HU } from '@/config/ui-text';

export function Disclaimer({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <p className="text-xs leading-relaxed text-slate-500">{HU.disclaimer}</p>
    );
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
      <span className="font-semibold">Figyelem: </span>
      {HU.disclaimer}
    </div>
  );
}
