import type { AnalysisResult, GlobalStats, RiskLevel } from './types';

/**
 * Process-local global statistics — incremented each time an analysis completes.
 * Not persistent: resets on deploy. Adequate for a showcase dashboard.
 */

interface InternalStats {
  reports_total: number;
  reports_completed: number;
  reports_failed: number;
  flags_total: number;
  flags_red: number;
  flags_yellow: number;
  flags_green: number;
  risk_counts: Record<RiskLevel, number>;
  category_counts: Map<string, number>;
  total_processing_ms: number;
  last_updated: string | null;
}

const globalKey = Symbol.for('ingatlancheck.stats');

function getStats(): InternalStats {
  const g = globalThis as unknown as Record<symbol, InternalStats>;
  if (!g[globalKey]) {
    g[globalKey] = {
      reports_total: 0,
      reports_completed: 0,
      reports_failed: 0,
      flags_total: 0,
      flags_red: 0,
      flags_yellow: 0,
      flags_green: 0,
      risk_counts: { low: 0, medium: 0, high: 0, critical: 0 },
      category_counts: new Map(),
      total_processing_ms: 0,
      last_updated: null,
    };
  }
  return g[globalKey];
}

export function recordAnalysis(analysis: AnalysisResult): void {
  const stats = getStats();
  stats.reports_total += 1;
  stats.reports_completed += 1;
  stats.flags_total += analysis.flags.length;
  stats.flags_red += analysis.stats.flags_red;
  stats.flags_yellow += analysis.stats.flags_yellow;
  stats.flags_green += analysis.stats.flags_green;
  stats.risk_counts[analysis.risk_score] += 1;
  stats.total_processing_ms += analysis.stats.processing_ms;
  for (const flag of analysis.flags) {
    stats.category_counts.set(
      flag.category,
      (stats.category_counts.get(flag.category) ?? 0) + 1
    );
  }
  stats.last_updated = new Date().toISOString();
}

export function recordFailure(): void {
  const stats = getStats();
  stats.reports_total += 1;
  stats.reports_failed += 1;
  stats.last_updated = new Date().toISOString();
}

export function getGlobalStats(): GlobalStats {
  const stats = getStats();
  const topCategories = [...stats.category_counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  const avgMs =
    stats.reports_completed > 0
      ? Math.round(stats.total_processing_ms / stats.reports_completed)
      : 0;

  return {
    reports_total: stats.reports_total,
    reports_completed: stats.reports_completed,
    reports_failed: stats.reports_failed,
    flags_total: stats.flags_total,
    flags_red: stats.flags_red,
    flags_yellow: stats.flags_yellow,
    flags_green: stats.flags_green,
    risk_distribution: { ...stats.risk_counts },
    top_flag_categories: topCategories,
    average_processing_ms: avgMs,
    last_updated: stats.last_updated,
  };
}
