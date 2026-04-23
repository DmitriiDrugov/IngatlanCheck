import Link from 'next/link';
import { HU } from '@/config/ui-text';
import type { AnalysisResult } from '@/lib/types';
import { Disclaimer } from './Disclaimer';
import { FlagCard } from './FlagCard';
import { RiskBadge } from './RiskBadge';

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate-900">
        {value ?? <span className="text-slate-400">{HU.prop_missing}</span>}
      </dd>
    </div>
  );
}

function severityOrder(sev: 'red' | 'yellow' | 'green'): number {
  return sev === 'red' ? 0 : sev === 'yellow' ? 1 : 2;
}

export function ReportView({ analysis }: { analysis: AnalysisResult }) {
  const sortedFlags = [...analysis.flags].sort(
    (a, b) => severityOrder(a.severity) - severityOrder(b.severity)
  );

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {HU.report_title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {HU.risk_label}:{' '}
            <span className="font-medium text-slate-700">
              {analysis.stats.flags_total} jelzés -{' '}
              {analysis.tulajdonosok.length} tulajdonos
            </span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <RiskBadge level={analysis.risk_score} />
          <Link
            href="/upload"
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:underline"
          >
            {HU.report_back} {'->'}
          </Link>
        </div>
      </header>

      <Disclaimer />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {HU.report_summary}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {analysis.summary_hu}
        </p>
        {analysis.document_quality.notes_hu && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
            {analysis.document_quality.notes_hu}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {HU.report_property}
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label={HU.prop_address} value={analysis.ingatlan.cim} />
          <Field label={HU.prop_hrsz} value={analysis.ingatlan.helyrajzi_szam} />
          <Field label={HU.prop_area} value={analysis.ingatlan.terulet} />
          <Field label={HU.prop_type} value={analysis.ingatlan.megnevezes} />
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {HU.report_owners}
        </h2>
        {analysis.tulajdonosok.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{HU.prop_missing}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {analysis.tulajdonosok.map((owner, idx) => (
              <li
                key={idx}
                className="grid gap-3 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-4"
              >
                <Field label={HU.owner_name} value={owner.name} />
                <Field label={HU.owner_share} value={owner.ownership_share} />
                <Field label={HU.owner_date} value={owner.acquisition_date} />
                <Field label={HU.owner_title} value={owner.acquisition_title} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {HU.report_flags}
        </h2>
        {sortedFlags.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            {HU.report_no_flags}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedFlags.map((flag) => (
              <FlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {HU.report_stats}
        </h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Field
            label={HU.doc_stats_chars}
            value={analysis.stats.character_count.toLocaleString('hu-HU')}
          />
          <Field
            label={HU.doc_stats_words}
            value={analysis.stats.word_count.toLocaleString('hu-HU')}
          />
          <Field
            label={HU.doc_stats_lines}
            value={analysis.stats.line_count.toLocaleString('hu-HU')}
          />
          <Field
            label={HU.doc_stats_sections}
            value={
              analysis.stats.detected_sections.length
                ? analysis.stats.detected_sections.join(', ')
                : null
            }
          />
          <Field
            label={HU.doc_stats_processing}
            value={`${analysis.stats.processing_ms} ms`}
          />
        </dl>
      </section>
    </div>
  );
}
