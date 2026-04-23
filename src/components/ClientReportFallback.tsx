'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Messages } from '@/lib/i18n';
import type { Report } from '@/lib/types';
import { loadCachedReport } from '@/lib/report-cache';
import { ReportView } from './ReportView';

export function ClientReportFallback({
  reportId,
  messages,
}: {
  reportId: string;
  messages: Messages;
}) {
  const [report, setReport] = useState<Report | null | undefined>(undefined);

  useEffect(() => {
    setReport(loadCachedReport(reportId));
  }, [reportId]);

  if (report === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {messages.report_title}
        </h1>
        <p className="rounded-xl bg-slate-100 px-5 py-4 text-sm text-slate-700 ring-1 ring-slate-200">
          {messages.upload_processing}
        </p>
      </div>
    );
  }

  if (!report || report.status !== 'completed' || !report.analysis) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {messages.report_title}
        </h1>
        <p className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          {messages.error_report_not_found}
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {messages.hero_cta_primary}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <ReportView analysis={report.analysis} messages={messages} />
    </div>
  );
}
