import type { Metadata } from 'next';
import Link from 'next/link';
import { HU } from '@/config/ui-text';
import { getReport } from '@/lib/report-store';
import { ReportView } from '@/components/ReportView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: HU.report_title,
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getReport(id);

  if (!report || report.status !== 'completed' || !report.analysis) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-6 py-24">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {HU.report_title}
        </h1>
        <p className="rounded-xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          {HU.error_report_not_found}
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {HU.hero_cta_primary}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <ReportView analysis={report.analysis} />
    </div>
  );
}
