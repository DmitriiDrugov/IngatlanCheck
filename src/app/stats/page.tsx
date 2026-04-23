import type { Metadata } from 'next';
import Link from 'next/link';
import { HU } from '@/config/ui-text';
import { getGlobalStats } from '@/lib/stats';
import type { RiskLevel } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: HU.stats_title,
  description: HU.stats_subtitle,
};

const RISK_LABEL: Record<RiskLevel, string> = {
  low: HU.risk_low,
  medium: HU.risk_medium,
  high: HU.risk_high,
  critical: HU.risk_critical,
};

const RISK_BAR: Record<RiskLevel, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div
        className={`mt-2 text-3xl font-semibold tracking-tight ${accent ?? 'text-slate-900'}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatsPage() {
  const stats = getGlobalStats();
  const hasData = stats.reports_total > 0;

  const maxRisk = Math.max(1, ...Object.values(stats.risk_distribution));
  const maxCategory = Math.max(
    1,
    ...stats.top_flag_categories.map((c) => c.count)
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {HU.stats_title}
        </h1>
        <p className="text-sm text-slate-600">{HU.stats_subtitle}</p>
      </header>

      {!hasData ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          <p>{HU.stats_empty}</p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {HU.hero_cta_primary}
          </Link>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={HU.stats_total} value={stats.reports_total} />
            <Metric
              label={HU.stats_completed}
              value={stats.reports_completed}
              accent="text-emerald-700"
            />
            <Metric
              label={HU.stats_failed}
              value={stats.reports_failed}
              accent={stats.reports_failed > 0 ? 'text-red-700' : undefined}
            />
            <Metric
              label={HU.stats_avg_time}
              value={`${stats.average_processing_ms} ms`}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={HU.stats_flags_total} value={stats.flags_total} />
            <Metric
              label={HU.stats_red}
              value={stats.flags_red}
              accent="text-red-700"
            />
            <Metric
              label={HU.stats_yellow}
              value={stats.flags_yellow}
              accent="text-amber-700"
            />
            <Metric
              label={HU.stats_green}
              value={stats.flags_green}
              accent="text-emerald-700"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                {HU.stats_risk_dist}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {(Object.keys(stats.risk_distribution) as RiskLevel[]).map(
                  (level) => {
                    const count = stats.risk_distribution[level];
                    const pct = Math.round((count / maxRisk) * 100);
                    return (
                      <li key={level} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">
                            {RISK_LABEL[level]}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full ${RISK_BAR[level]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                {HU.stats_top_categories}
              </h2>
              {stats.top_flag_categories.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">-</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {stats.top_flag_categories.map((c) => {
                    const pct = Math.round((c.count / maxCategory) * 100);
                    return (
                      <li key={c.category} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{c.category}</span>
                          <span className="font-semibold text-slate-900">
                            {c.count}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-slate-900"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {stats.last_updated && (
            <p className="text-xs text-slate-500">
              {HU.stats_updated}:{' '}
              {new Date(stats.last_updated).toLocaleString('hu-HU')}
            </p>
          )}
        </>
      )}
    </div>
  );
}
