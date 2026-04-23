import type { Report } from './types';

const REPORT_CACHE_PREFIX = 'ingatlancheck:report:';

function getReportCacheKey(reportId: string): string {
  return `${REPORT_CACHE_PREFIX}${reportId}`;
}

export function cacheReport(report: Report): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(getReportCacheKey(report.id), JSON.stringify(report));
}

export function loadCachedReport(reportId: string): Report | null {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(getReportCacheKey(reportId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Report;
  } catch {
    window.sessionStorage.removeItem(getReportCacheKey(reportId));
    return null;
  }
}
