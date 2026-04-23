import type { Messages } from '@/lib/i18n';
import type { AnalysisFlag, ConfidenceLevel, FlagSeverity } from '@/lib/types';

const CONFIDENCE_KEY: Record<ConfidenceLevel, keyof Messages> = {
  low: 'confidence_low',
  medium: 'confidence_medium',
  high: 'confidence_high',
};

export function FlagCard({
  flag,
  messages,
}: {
  flag: AnalysisFlag;
  messages: Messages;
}) {
  const severityStyle: Record<
    FlagSeverity,
    { border: string; bg: string; dot: string; label: string; labelBg: string }
  > = {
    red: {
      border: 'border-red-300',
      bg: 'bg-red-50/60',
      dot: 'bg-red-500',
      label: messages.flag_red,
      labelBg: 'bg-red-100 text-red-800',
    },
    yellow: {
      border: 'border-amber-300',
      bg: 'bg-amber-50/60',
      dot: 'bg-amber-500',
      label: messages.flag_yellow,
      labelBg: 'bg-amber-100 text-amber-900',
    },
    green: {
      border: 'border-emerald-300',
      bg: 'bg-emerald-50/60',
      dot: 'bg-emerald-500',
      label: messages.flag_green,
      labelBg: 'bg-emerald-100 text-emerald-800',
    },
  };

  const style = severityStyle[flag.severity];

  return (
    <article className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-sm`}>
      <header className="flex flex-wrap items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${style.dot}`} />
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${style.labelBg}`}
        >
          {style.label}
        </span>
        <span className="text-xs text-slate-500">{flag.category}</span>
        {flag.source_section && (
          <span className="text-xs text-slate-400">
            - {messages.flag_section}: {flag.source_section}
          </span>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {messages.flag_confidence}: {messages[CONFIDENCE_KEY[flag.confidence]]}
        </span>
      </header>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{flag.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{flag.description}</p>
      {flag.evidence_excerpt && (
        <blockquote className="mt-4 rounded-lg border-l-4 border-slate-300 bg-white/70 px-4 py-3 text-xs leading-relaxed text-slate-600">
          <div className="mb-1 font-medium uppercase tracking-wide text-slate-400">
            {messages.flag_evidence}
          </div>
          <div className="italic">&ldquo;{flag.evidence_excerpt}&rdquo;</div>
        </blockquote>
      )}
      <div className="mt-4 rounded-lg bg-white/80 px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200">
        <span className="font-semibold">{messages.flag_recommendation}: </span>
        {flag.recommendation}
      </div>
    </article>
  );
}
