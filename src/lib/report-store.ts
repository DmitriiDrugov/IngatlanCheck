import { randomUUID } from 'crypto';
import { REPORT_TTL_MS } from '@/config/constants';
import type { Locale } from './i18n';
import type { AnalysisResult, Report } from './types';
import { recordAnalysis } from './stats';

/**
 * Process-local, in-memory store for showcase reports.
 * Reports are ephemeral and self-expire after REPORT_TTL_MS.
 * This keeps the showcase free of external services (no DB, no storage).
 */

interface StoredReport extends Report {
  expires_at: number;
}

const globalKey = Symbol.for('ingatlancheck.reportStore');
type Store = Map<string, StoredReport>;

function getStore(): Store {
  const g = globalThis as unknown as Record<symbol, Store>;
  if (!g[globalKey]) g[globalKey] = new Map<string, StoredReport>();
  return g[globalKey];
}

function prune(store: Store): void {
  const now = Date.now();
  for (const [id, report] of store) {
    if (report.expires_at < now) store.delete(id);
  }
}

export function createReport(analysis: AnalysisResult, locale: Locale): Report {
  const store = getStore();
  prune(store);

  const id = randomUUID();
  const now = new Date();
  const report: StoredReport = {
    id,
    locale,
    status: 'completed',
    analysis,
    error_message: null,
    created_at: now.toISOString(),
    completed_at: now.toISOString(),
    expires_at: Date.now() + REPORT_TTL_MS,
  };
  store.set(id, report);

  recordAnalysis(analysis);

  return stripInternal(report);
}

export function createFailedReport(
  errorMessage: string,
  locale: Locale
): Report {
  const store = getStore();
  prune(store);

  const id = randomUUID();
  const now = new Date();
  const report: StoredReport = {
    id,
    locale,
    status: 'failed',
    analysis: null,
    error_message: errorMessage,
    created_at: now.toISOString(),
    completed_at: now.toISOString(),
    expires_at: Date.now() + REPORT_TTL_MS,
  };
  store.set(id, report);
  return stripInternal(report);
}

export function getReport(id: string): Report | null {
  const store = getStore();
  prune(store);
  const report = store.get(id);
  return report ? stripInternal(report) : null;
}

function stripInternal(report: StoredReport): Report {
  const { expires_at: _expiresAt, ...rest } = report;
  void _expiresAt;
  return rest;
}
